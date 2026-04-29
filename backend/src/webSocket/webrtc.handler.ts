import { WebSocket } from 'ws';
import { WebRTCAnswer, WebRTCCallEnd, WebRTCCallReject, WebRTCIceCandidate, WebRTCMessage, WebRTCMessageSchema, WebRTCOffer } from '../types/webrtc.types';
import { createCallSession, updateCallStatus, endCallSession, isUserAvailable } from '../services/call.service';

/** Gestisce i messaggi WebRTC per il signaling delle videochiamate
 * @param message - Messaggio WebRTC ricevuto
 * @param clientSocket - WebSocket del client mittente
 * @param clients - Mappa userId -> WebSocket
 * @param userIds - Mappa WebSocket -> userId
 */

export function handleWebRTCSignaling (
    message: WebRTCMessage,
    clientSocket: WebSocket,
    clients: Map<number, WebSocket>,
    userIds: Map<WebSocket, number>
): void {
    // Validazione del messaggio in ingresso con zod
    const validationResult = WebRTCMessageSchema.safeParse(message);
    if (!validationResult.success) {
        clientSocket.send(JSON.stringify({
            type: 'error',
            message: 'Invalid WebRTC message format',
            errors: validationResult.error.issues,
        }));
        return;
    }

    const senderId = userIds.get(clientSocket);

    if (!senderId) {
        clientSocket.send(JSON.stringify({
            type: 'error',
            message: 'User not authenticated',
        }));
        return;
    }

    const recipientSocket = clients.get(message.to);

    if (!recipientSocket || recipientSocket.readyState !== WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({
            type: 'call-error',
            message: 'Destinatary not available',
        }));
        return;
    }

    switch (message.type) {
        case 'call-offer':
            handleCallOffer(message, senderId, recipientSocket, clientSocket, clients);
            break;

        case 'call-answer':
            handleCallAnswer(message, senderId, recipientSocket);
            break;

        case 'ice-candidate':
            handleIceCandidate(message, senderId, recipientSocket);
            break;

        case 'call-reject':
            handleCallReject(message, senderId, recipientSocket);
            break;

        case 'end-call':
            handleCallEnd(message, senderId, recipientSocket, clients);
            break;
    }
};

/**
 * Gestisce l'offerta di chiamata
 */
function handleCallOffer(
    message: WebRTCOffer,
    senderId: number,
    recipientSocket: WebSocket,
    senderSocket: WebSocket,
    clients: Map<number, WebSocket>
): void {
    // Verifica se il destinatario è disponibile

    // Verifica se il mittente è disponibile
    if (!isUserAvailable(senderId)) {
        senderSocket.send(JSON.stringify({
            type: 'call-error',
            message: 'You are already in a call',
        }));
        return;
    }

    // Crea una nuova sessione di chiamata
    createCallSession(senderId, message.to, message.conversationId);

    // Inoltra l'offerta di chiamata al destinatario
    recipientSocket.send(JSON.stringify({
        type: 'call-offer',
        from: senderId,
        sdp: message.sdp,
        conversationId: message.conversationId,
    }));
}

/**
 * Gestisce la risposta alla chiamata
 */
function handleCallAnswer(
    message: WebRTCAnswer,
    senderId: number,
    recipientSocket: WebSocket
): void {
    // Aggiorna lo stato della chiamata a "ACTIVE"
    updateCallStatus(senderId, message.to, 'ACTIVE');

    // Inoltra la risposta alla chiamata al mittente originale
    recipientSocket.send(JSON.stringify({
        type: 'call-answer',
        from: senderId,
        sdp: message.sdp,
    }));
}

/**
 * Gestisce i candidati ICE (per attraversare NAT/firewall)
 */
function handleIceCandidate(
    message: WebRTCIceCandidate,
    senderId: number,
    recipientSocket: WebSocket
): void {
    // Inoltra il candidato ICE al destinatario
    recipientSocket.send(JSON.stringify({
        type: 'ice-candidate',
        from: senderId,
        candidate: message.candidate,
    }));
}

/**
 * Gestisce il rifiuto della chiamata
 */
function handleCallReject(
    message: WebRTCCallReject,
    senderId: number,
    recipientSocket: WebSocket
): void {
    // Termina la sessione di chiamata
    endCallSession(message.to, senderId);

    // Verifica il chiamante del rifiuto
    recipientSocket.send(JSON.stringify({
        type: 'call-reject',
        from: senderId,
    }));
}

/**
 * Gestisce la terminazione della chiamata
 */
function handleCallEnd(
    message: WebRTCCallEnd,
    senderId: number,
    recipientSocket: WebSocket,
    clients: Map<number, WebSocket>
): void {
    // Termina la sessione di chiamata
    endCallSession(senderId, message.to);

    // Notifica SOLO il destinatario (non chi ha chiuso)
    recipientSocket.send(JSON.stringify({
        type: 'end-call',
        from: senderId,
    }));
}
