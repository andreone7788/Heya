import crypto from 'crypto';

// Funzione per generare una password random (non comunicata all'utente)
export function generateRandomPassword(length: number = 6): string {
    return crypto.randomBytes(length).toString('hex');
}