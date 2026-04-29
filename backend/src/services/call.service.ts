import { CallSession } from '../types/webrtc.types';

// Mappa delle chiamate in memoria (non nel DB)
// Chiave: "callerId-receiverId" per identificare univocamente ogni chiamata
const activeCalls = new Map<string, CallSession>();

/**
 * Crea una nuova sessione di chiamata 
 * @param callerId - ID di chi chiama
 * @param receiverId - ID di chi riceve la chiamata
 * @param conversationId - ID della conversazione associata
 * @return La sessione di chiamata creata
 */

export function createCallSession(
    callerId: number,
    receiverId: number,
    conversationId: number
): CallSession {
    const callId = `${callerId}-${receiverId}`;
    const session: CallSession = {
        callerId,
        receiverId,
        conversationId,
        startTime: new Date(),
        status: 'RINGING',
    };

    activeCalls.set(callId, session);
    
    if (process.env.NODE_ENV === 'development') {
        console.log(`Call session created: ${callId}`);
    }
    
    return session;
};

/**
 * Recupera una sessione di chiamata attiva
 * @param callerId - ID di chi chiama
 * @param receiverId - ID di chi riceve la chiamata
 * @param status - nuovo stato della chiamata
*/

export function updateCallStatus(
    callerId: number,
    receiverId: number,
    status: CallSession['status']
): void {
    const callId = `${callerId}-${receiverId}`;
    const session = activeCalls.get(callId);

    if (session) {
        session.status = status;
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`Call session updated: ${callId} to status ${status}`);
        }
    }
}

/**
 * Termina una sessione di chiamata attiva
 * @param callerId - ID di chi chiama
 * @param receiverId - ID di chi riceve la chiamata
 */

export function endCallSession(
    callerId: number,
    receiverId: number
) : void {
    const callId1 = `${callerId}-${receiverId}`;
    const callId2 = `${receiverId}-${callerId}`;

    const deleted = activeCalls.delete(callId1) || activeCalls.delete(callId2);
    
    if (process.env.NODE_ENV === 'development' && deleted) {
        console.log(`Call session ended: ${callId1} or ${callId2}`);
    }
};

/**
 * Verifica se un utente è già in una chiamata attiva
 * @param userId - ID dell'utente da verificare
 * @return true se l'utente è in chiamata, false altrimenti
 */

export function getActiveCall(userId: number): CallSession | undefined {
    return Array.from(activeCalls.values()).find(session => 
        (session.callerId === userId || session.receiverId === userId) && 
        session.status !== 'ENDED'
    );
};

/**
 * Verifica se un utente è disponibile per una nuova chiamata
 * @param userId - ID dell'utente da verificare
 * @return true se l'utente è disponibile, false se è già in chiamata
 */

export function isUserAvailable(userId: number): boolean {
    return !getActiveCall(userId);
}


