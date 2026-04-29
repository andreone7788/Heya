import { ConversationsListSchema, type ConversationsList } from '../types/conversation.types';
import { MessageSchema, type Message } from '../types/message.types';

const apiUrl = import.meta.env.VITE_API_URL;
const HEADER = { "Content-Type": "application/json" };

// GET /heya/conversations - Lista conversazioni dell'utente
export const getUserConversationsApi = async (): Promise<ConversationsList> => {
    const url = `${apiUrl}/conversations`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: HEADER,
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Errore nel recupero delle conversazioni");
    }

    const data = await response.json();
    const validData = ConversationsListSchema.safeParse(data);

    if (!validData.success) {
        console.error('Errore validazione:', validData.error);
        throw new Error("Dati non validi ricevuti dal server");
    }

    return validData.data;
};

// GET /heya/conversations/between/:email1/:email2 - Trova o crea conversazione tra due utenti
export const getOrCreateConversationApi = async (email1: string, email2: string) => {
    const url = `${apiUrl}/conversations/between/${encodeURIComponent(email1)}/${encodeURIComponent(email2)}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: HEADER,
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Errore nel recupero conversazione");
    }

    return await response.json();
};

// GET /heya/conversations/:conversationId/messages - Messaggi di una conversazione
export const getConversationMessagesApi = async (conversationId: number, limit?: number): Promise<Message[]> => {
    const url = `${apiUrl}/conversations/${conversationId}/messages${limit ? `?limit=${limit}` : ''}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: HEADER,
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Errore nel recupero dei messaggi");
    }

    const data = await response.json();
    
    // Valida array di messaggi
    const messagesArraySchema = MessageSchema.array();
    const validData = messagesArraySchema.safeParse(data);

    if (!validData.success) {
        console.error('Errore validazione:', validData.error);
        throw new Error("Dati non validi ricevuti dal server");
    }

    return validData.data;
};

// PUT /heya/conversations/messages/:messageId/read - Segna messaggio come letto
export const markMessageAsReadApi = async (messageId: number): Promise<{ success: boolean }> => {
    const url = `${apiUrl}/conversations/messages/${messageId}/read`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: HEADER,
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Errore nell'aggiornamento del messaggio");
    }

    return await response.json();
};

// GET /heya/conversations/unread - Ottieni conteggio messaggi non letti
export const getUnreadCountsApi = async (): Promise<Record<number, number>> => {
    const url = `${apiUrl}/conversations/unread`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: HEADER,
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Errore nel recupero dei badge non letti");
    }

    return await response.json();
};

// PUT /heya/conversations/:conversationId/mark-read - Segna conversazione come letta
export const markConversationAsReadApi = async (conversationId: number): Promise<{ success: boolean }> => {
    const url = `${apiUrl}/conversations/${conversationId}/mark-read`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: HEADER,
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Errore nell'aggiornamento della conversazione");
    }

    return await response.json();
};