//FEDERICA

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

// Si utilizza una chiave condivisa (poi migreremo a chiavi per conversazione)
const MASTER_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(KEY_LENGTH).toString('hex');

// Funzione per criptare un messaggio
export function encryptMessage(plaintext: string): { 
    ciphertext: string; 
    iv: Buffer; 
    tag: Buffer 
} {
    const key = Buffer.from(MASTER_KEY, 'hex');
    const iv = crypto.randomBytes(12); // 96 bits per GCM
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const encrypted = cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex');
    const tag = cipher.getAuthTag();
    
    return { ciphertext: encrypted, iv, tag };
}

// Funzione per decriptare un messaggio
export function decryptMessage(
    ciphertext: string, 
    iv: Buffer, 
    tag: Buffer
): string {
    const key = Buffer.from(MASTER_KEY, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    const plaintext = decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8');
    
    return plaintext;
}