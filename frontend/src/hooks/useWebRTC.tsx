//ANDREA

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useWebSocket } from '../context/wsContext';
import { IncomingCallState, WebRTCMessage, WebRTCOfferMessage, WebRTCAnswerMessage, WebRTCIceCandidateMessage, WebRTCMessageSchema } from '../types/socket.types';
import { useTranslation } from 'react-i18next';

interface UseWebRTCProps {
    recipientId: number | null;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export const useWebRTC = ({ recipientId, localVideoRef, remoteVideoRef }: UseWebRTCProps) => {
    const { ws } = useWebSocket();
    const [isInCall, setIsInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState<IncomingCallState | null>(null);
    const [activeCallPartnerId, setActiveCallPartnerId] = useState<number | null>(null); // Traccia il partner della chiamata attiva
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const pendingIceCandidatesRef = useRef<RTCIceCandidate[]>([]);
    const {t} = useTranslation()
    
    // Configurazione STUN servers per attraversare NAT (useMemo per evitare ricreazioni)
    const configuration = useMemo(() => ({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    }), []);

    // Crea e configura RTCPeerConnection (si usa targetId per chiamate in entrata)
    const createPeerConnection = useCallback((targetId?: number) => {
        const pc = new RTCPeerConnection(configuration);

        // Aggiungi tracce locali (audio/video) alla connessione
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                if (localStreamRef.current) {
                    pc.addTrack(track, localStreamRef.current);
                }
            });
        }

        // Quando arriva lo stream remoto, mostralo nel video element
        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0]; // Assegna il primo stream ricevuto
            }
        };

        // Quando viene generato un ICE candidate, invialo al peer remoto
        pc.onicecandidate = (event) => {
            if (event.candidate && ws && ws.readyState === WebSocket.OPEN) {
                // Usa targetId se fornito, altrimenti recipientId
                const to = targetId ?? recipientId;
                ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    to,
                    candidate: {
                        candidate: event.candidate.candidate,
                        sdpMid: event.candidate.sdpMid,
                        sdpMLineIndex: event.candidate.sdpMLineIndex
                    }
                }));
            }
        };

        // Monitora lo stato della connessione
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                console.warn('Connessione interrotta:', pc.connectionState);
            }
        };

        // Monitora lo stato ICE (per debug)
        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'failed') {
                console.warn('ICE failed - potrebbero essere necessari server TURN');
            }
        };

        // Salva la connessione nel ref
        peerConnectionRef.current = pc;
        return pc;
    }, [recipientId, ws, remoteVideoRef, configuration]);

    // Avvia una nuova chiamata
    const startCall = useCallback(async (conversationId: number) => {
        if (!recipientId || !ws) {
            console.error('Impossibile avviare la chiamata: recipientId o WebSocket non disponibili');
            return;
        }

        try {
            // Salva chi stiamo chiamando
            setActiveCallPartnerId(recipientId);

            let stream: MediaStream;

            // 1. Prova prima con video + audio
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
            } catch (videoError) {
                // Se la webcam è occupata o non leggibile, fallback a solo audio
                if (videoError instanceof DOMException && videoError.name === 'NotReadableError') {
                    console.warn('Video non disponibile, utilizzo solo audio');
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: false,
                        audio: true,
                    });
                    alert(t('RTChook.webcamBusyStart'));
                } else {
                    throw videoError;
                }
            }

            localStreamRef.current = stream;

            // Aggiorna UI PRIMA di creare la peer connection (per aprire il modal)
            setIsInCall(true);

            // Aspetta che il DOM si aggiorni e il modal si renderizzi
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assegna lo stream locale al video element
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // 2. Crea RTCPeerConnection e aggiungi tracce locali
            const pc = createPeerConnection();

            // 3. Crea offerta SDP
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // 4. Invio offer al backend
            ws.send(JSON.stringify({
                type: 'call-offer',
                to: recipientId,
                sdp: offer,
                conversationId
            }));

        } catch (error) {
            console.error('Errore durante l\'avvio della chiamata:', error);

            // Gestione errori specifici con messaggi tradotti
            let errorMessage = t('RTChook.startGeneric');
            if (error instanceof DOMException) {
                switch (error.name) {
                    case 'NotReadableError':
                        errorMessage = t('RTChook.notReadable');
                        break;
                    case 'NotAllowedError':
                        errorMessage = t('RTChook.notAllowed');
                        break;
                    case 'NotFoundError':
                        errorMessage = t('RTChook.notFound');
                        break;
                    case 'OverconstrainedError':
                        errorMessage = t('RTChook.overconstrained');
                        break;
                }
            }

            alert(errorMessage);
            setIsInCall(false);
            setActiveCallPartnerId(null); // Reset anche questo
        }
    }, [recipientId, ws, createPeerConnection, localVideoRef, t]);

    // Accetta una chiamata in arrivo
    const acceptCall = useCallback(async () => {
        if (!incomingCall || !ws) {
            console.error('Nessuna chiamata in arrivo da accettare');
            return;
        }

        try {

            // Salva chi ci ha chiamato
            setActiveCallPartnerId(incomingCall.from);

            let stream: MediaStream;

            // 1. Prova prima con video + audio
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
            } catch (videoError) {
                // Se la webcam è occupata o non leggibile, fallback a solo audio
                if (videoError instanceof DOMException && videoError.name === 'NotReadableError') {
                    console.warn('Video non disponibile, utilizzo solo audio');
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: false,
                        audio: true,
                    });
                    alert(t('RTChook.webcamBusyAccept'));
                } else {
                    throw videoError;
                }
            }

            localStreamRef.current = stream;

            // Aggiorna UI PRIMA di creare la peer connection (per aprire il modal)
            setIsInCall(true);
            setIncomingCall(null);

            // Aspetta che il DOM si aggiorni e il modal si renderizzi
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assegna lo stream locale al video element
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // 2. Crea PeerConnection usando la funzione centralizzata
            const pc = createPeerConnection(incomingCall.from);

            // 3. Imposta la remote description con l'offerta ricevuta
            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.sdp));

            // 4. Crea answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // 5. Invia answer al backend
            ws.send(JSON.stringify({
                type: 'call-answer',
                to: incomingCall.from,
                sdp: answer,
            }));

            // 6. Aggiungi ICE candidates in attesa
            pendingIceCandidatesRef.current.forEach(candidate => {
                pc.addIceCandidate(candidate);
            });
            pendingIceCandidatesRef.current = [];

        } catch (error) {
            console.error('Errore durante acceptCall:', error);

            // Gestione errori specifici con messaggi tradotti
            let errorMessage = t('RTChook.acceptGeneric');
            if (error instanceof DOMException) {
                switch (error.name) {
                    case 'NotReadableError':
                        errorMessage = t('RTChook.notReadable');
                        break;
                    case 'NotAllowedError':
                        errorMessage = t('RTChook.notAllowed');
                        break;
                    case 'NotFoundError':
                        errorMessage = t('RTChook.notFound');
                        break;
                    case 'OverconstrainedError':
                        errorMessage = t('RTChook.overconstrained');
                        break;
                }
            }

            alert(errorMessage);

            // Invia messaggio di errore al chiamante in caso di fallimento
            if (ws && activeCallPartnerId) {
                ws.send(JSON.stringify({
                    type: 'call-error',
                    to: activeCallPartnerId, // Usa activeCallPartnerId per inviare l'errore al chiamante
                    message: errorMessage,
                }));
            }

            setIncomingCall(null);
            setIsInCall(false);
            setActiveCallPartnerId(null); // Reset anche questo
        }
    }, [createPeerConnection, incomingCall, ws, activeCallPartnerId, localVideoRef, t]);

    // Rifiuta una chiamata in arrivo
    const rejectCall = useCallback(() => {
        if (!incomingCall || !ws) {
            console.error('Nessuna chiamata in arrivo da rifiutare');
            return;
        }

        ws.send(JSON.stringify({
            type: 'call-reject',
            to: incomingCall.from,
        }));
        setIncomingCall(null);
    }, [incomingCall, ws]);

    // Termina la chiamata corrente
    const endCall = useCallback(() => {
        // Usa activeCallPartnerId invece di recipientId o incomingCall
        const targetId = activeCallPartnerId;

        if (!targetId) {
            console.error('Nessun partner attivo trovato');
        }

        // Notifica l'altro peer
        if (ws && targetId && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'end-call',
                to: targetId,
            }));
        }

        // Chiudi la connessione peer
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Ferma lo stream locale (camera e microfono)
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        // Pulisci video elements
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

        setIsInCall(false);
        setIncomingCall(null);
        setActiveCallPartnerId(null); // Reset partner
    }, [ws, activeCallPartnerId, localVideoRef, remoteVideoRef]);

    // Ascolta messaggi WebSocket per segnalazione WebRTC
    useEffect(() => {
        if (!ws) return;

        const handleMessage = async (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);

                // Valida il messaggio con Zod
                const validationResult = WebRTCMessageSchema.safeParse(data);

                // Se non è un messaggio WebRTC, ignora
                if (!validationResult.success) {
                    return;
                }

                const message = validationResult.data as WebRTCMessage;

                switch (message.type) {
                    case 'call-offer': {
                        const offerMsg = message as WebRTCOfferMessage;

                        setIncomingCall({
                            from: offerMsg.from,
                            conversationId: offerMsg.conversationId,
                            sdp: offerMsg.sdp
                        });
                        break;
                    }

                    case 'call-answer': {
                        const answerMsg = message as WebRTCAnswerMessage;

                        if (peerConnectionRef.current) {
                            await peerConnectionRef.current.setRemoteDescription(
                                new RTCSessionDescription(answerMsg.sdp)
                            );
                        }
                        break;
                    }

                    case 'ice-candidate': {
                        const iceMsg = message as WebRTCIceCandidateMessage;

                        if (peerConnectionRef.current) {
                            await peerConnectionRef.current.addIceCandidate(
                                new RTCIceCandidate(iceMsg.candidate)
                            );
                        } else {
                            // Se la connessione non è ancora pronta, metti in coda il candidate
                            pendingIceCandidatesRef.current.push(new RTCIceCandidate(iceMsg.candidate));
                        }
                        break;
                    }

                    case 'call-reject':
                        alert(t('RTChook.reject'));
                        endCall();
                        break;

                    case 'end-call':
                        
                        if (peerConnectionRef.current) {
                            peerConnectionRef.current.close();
                            peerConnectionRef.current = null;
                        }
                        if (localStreamRef.current) {
                            localStreamRef.current.getTracks().forEach(track => track.stop());
                            localStreamRef.current = null;
                        }
                        if (localVideoRef.current) localVideoRef.current.srcObject = null;
                        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                        
                        setIsInCall(false);
                        setIncomingCall(null);
                        setActiveCallPartnerId(null); // Reset partner
                        break;

                    case 'call-error':
                        console.error('Errore di chiamata:', message.message);
                        alert(`${t('RTChook.call-err')} ${message.message}`);
                        endCall();
                        break;
                }
            } catch (error) {
                console.error('Errore nel gestire il messaggio WebSocket:', error);
            }
        };
        
        // Aggiungi listener per i messaggi WebSocket
        ws.addEventListener('message', handleMessage);

        return () => {
            ws.removeEventListener('message', handleMessage); // Cleanup listener
        };
    }, [ws, endCall, localVideoRef, remoteVideoRef, t]);

    // Backup: assicura che il video locale sia assegnato quando il modal si apre
    useEffect(() => {
        // Quando isInCall diventa true, assicurati che il video locale sia assegnato
        if (isInCall && localStreamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    }, [isInCall, localVideoRef]);

    return {
        isInCall,
        incomingCall,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
    };
};