import { ReactNode, useEffect, useState, useCallback, useRef } from 'react';
import { WebSocketContext } from '../context/wsContext';
import type { WebSocketMessage, SendMessage, RegisterWebSocket } from '../types/socket.types';

const WS_URL = import.meta.env.VITE_WS_URL;

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [presenceMap, setPresenceMap] = useState<Map<number, 'ONLINE' | 'OFFLINE' | 'AWAY'>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const isConnectingRef = useRef(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Previeni doppia inizializzazione (React 18 Strict Mode)
    if (hasInitialized.current) {
      return;
    }

    if (isConnectingRef.current) {
      return;
    }

    hasInitialized.current = true;
    isConnectingRef.current = true;

    const socket = new WebSocket(WS_URL);
    wsRef.current = socket;

    socket.onopen = () => {
      setWs(socket);
      setIsConnected(true);
      isConnectingRef.current = false; // ✅ Reset dopo connessione
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        // IGNORA messaggi WebRTC (gestiti da useWebRTC)
        if (['call-offer', 'call-answer', 'ice-candidate', 'call-reject', 'end-call', 'call-error'].includes(data.type)) {
          return;
        }

        // Valida e gestisci solo messaggi chat
        if (data.type === 'presence' && data.userId && data.status) {
          setPresenceMap(prev => new Map(prev).set(data.userId!, data.status!));
        } else if (data.type === 'message') {
          
          // Controllo per prevenire duplicati
          setMessages(prev => {
            const isDuplicate = prev.some(msg => 
              msg.from === data.from && 
              msg.to === data.to &&
              msg.text === data.text && 
              msg.timestamp === data.timestamp
            );
            
            if (isDuplicate) {
              console.warn('⚠️ FRONTEND: Messaggio duplicato ignorato');
              return prev;
            }
            
            return [...prev, data as WebSocketMessage];
          });
        } else if (data.type === 'sent') {
          setMessages(prev => [...prev, data as WebSocketMessage]);
        } else if (data.type === 'error') {
          console.error('❌ Errore dal server:', data.message);
        }
      } catch (error) {
        console.error('❌ Errore parsing messaggio WebSocket:', error);
      }
    };

    socket.onclose = () => {
      console.warn('🔴 WebSocket disconnesso');
      setIsConnected(false);
      setWs(null);
      wsRef.current = null;
      isConnectingRef.current = false;
      hasInitialized.current = false; // Reset per permettere riconnessione
    };

    socket.onerror = (error) => {
      console.error('❌ Errore WebSocket:', error);
      console.error('📍 URL tentato:', WS_URL);
      isConnectingRef.current = false;
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
      // Non resettiamo hasInitialized qui per evitare doppia connessione
    };
  }, []); // Dipendenze vuote

  const registerUser = useCallback((userId: number, status: 'ONLINE' | 'OFFLINE' | 'AWAY' = 'ONLINE') => {
    const socket = wsRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const msg: RegisterWebSocket = {
        type: 'register',
        userId,
        status // Usa lo stato passato come argomento o il valore predefinito
      };
      socket.send(JSON.stringify(msg));
    } else {
      console.warn('⚠️ Impossibile registrare utente: WebSocket non connesso');
    }
  }, []);

  const sendMessage = useCallback((to: number, text: string) => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket non connesso, impossibile inviare messaggio');
      return;
    }

    if (!text.trim()) {
      console.warn('⚠️ Messaggio vuoto, invio annullato');
      return;
    }

    const message: SendMessage = {
      type: 'private',
      to,
      text: text.trim(),
    };

    socket.send(JSON.stringify(message));
  }, []);

  const disconnect = useCallback(() => {
    const socket = wsRef.current;
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      socket.close();
      setIsConnected(false);
      setMessages([]);
      setPresenceMap(new Map());
      wsRef.current = null;
      hasInitialized.current = false;
      isConnectingRef.current = false;
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{
      ws,
      isConnected,
      messages,
      presenceMap,
      sendMessage,
      registerUser,
      disconnect
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};