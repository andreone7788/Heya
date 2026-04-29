import { ContactsListSchema, UserChatInfoSchema, type ContactsList, type UserChatInfo } from '../types/conversation.partecipant.types';

const apiUrl = import.meta.env.VITE_API_URL;
const HEADER = { "Content-Type": "application/json" };

// GET /heya/contacts - Lista tutti gli utenti disponibili per chat
export const getAllContactsApi = async (): Promise<ContactsList> => {
    const url = `${apiUrl}/contacts`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: HEADER,
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Errore nel recupero dei contatti");
    }

    const data = await response.json();
    const validData = ContactsListSchema.safeParse(data);

    if (!validData.success) {
        console.error('Errore validazione:', validData.error);
        throw new Error("Dati non validi ricevuti dal server");
    }

    return validData.data;
};

// GET /heya/contacts/by-email/:email - Cerca utente tramite email
export const getUserByEmailApi = async (email: string): Promise<UserChatInfo> => {
    const url = `${apiUrl}/contacts/by-email/${encodeURIComponent(email)}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: HEADER,
        credentials: 'include',
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Utente non trovato");
        }
        throw new Error("Errore nel recupero delle informazioni utente");
    }

    const data = await response.json();
    const validData = UserChatInfoSchema.safeParse(data);

    if (!validData.success) {
        console.error('Errore validazione:', validData.error);
        throw new Error("Dati non validi ricevuti dal server");
    }

    return validData.data;
};

// GET /heya/contacts/:userId - Info specifiche di un utente
export const getUserForChatApi = async (userId: number): Promise<UserChatInfo> => {
    const url = `${apiUrl}/contacts/${userId}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: HEADER,
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Errore nel recupero delle informazioni utente");
    }

    const data = await response.json();
    const validData = UserChatInfoSchema.safeParse(data);

    if (!validData.success) {
        console.error('Errore validazione:', validData.error);
        throw new Error("Dati non validi ricevuti dal server");
    }

    return validData.data;
};