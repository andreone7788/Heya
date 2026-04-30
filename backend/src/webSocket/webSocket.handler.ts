//FEDERICA

import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { saveMessage, getOrCreateConversation } from '../controllers/conversation.controller';
import { UpdatePresenceStatus } from '../models/user.model';
import { handleWebRTCSignaling } from './webrtc.handler';

const clients = new Map<number, WebSocket>();
const userIds = new Map<WebSocket, number>();

// Funzione per trasmettere aggiornamenti di presenza a tutti i client connessi
function broadcastPresenceUpdate(userId: number, status: string) {
    const presenceMessage = JSON.stringify({
        type: 'presence',
        userId,
        status
    });

    // Invia a tutti (incluso l'utente stesso)
    clients.forEach((client, clientId) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(presenceMessage);
        }
    });
}

// Inizializza il server WebSocket
export function initializeWebSocket(server: Server) {
    const wsServer = new WebSocketServer({ server });

    // Gestione connessioni WebSocket
    wsServer.on('connection', (clientSocket) => {
         const pingInterval = setInterval(() => { // Mantieni viva la connessione
            if (clientSocket.readyState === WebSocket.OPEN) {
                clientSocket.ping();
            }
        }, 30000);

        clientSocket.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());

                // Registrazione utente al WebSocket
                if (message.type === 'register') {
                    const userId = message.userId;
                    const status = message.status?.toUpperCase() || 'ONLINE';

                    const existingSocket = clients.get(userId);
                    if (existingSocket && existingSocket !== clientSocket) {
                        existingSocket.close(1000, 'Nuova connessione da altro dispositivo');
                    }

                    // Mappa userId al socket
                    clients.set(userId, clientSocket);
                    userIds.set(clientSocket, userId);

                    await UpdatePresenceStatus(userId, status);
                    broadcastPresenceUpdate(userId, status);

                    return;
                }

                // Messaggio privato
                if (message.type === 'private') {
                    const userId = userIds.get(clientSocket);

                    if (!userId) {
                        clientSocket.send(JSON.stringify({
                            type: 'error',
                            message: 'Utente non registrato'
                        }));
                        return;
                    }

                    const receiverId = message.to;
                    const conversation = await getOrCreateConversation(userId, receiverId);
                    await saveMessage(userId, conversation.id, message.text);

                    const messageData = {
                        type: 'message',
                        from: userId,
                        to: receiverId,
                        conversationId: conversation.id,
                        text: message.text,
                        timestamp: new Date().toISOString()
                    };

                    const recipientSocket = clients.get(receiverId);
                    if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
                        recipientSocket.send(JSON.stringify(messageData));
                    }
                    clientSocket.send(JSON.stringify(messageData));
                }

                if (['call-offer', 'call-answer', 'ice-candidate', 'call-reject', 'end-call'].includes(message.type)) {
                    handleWebRTCSignaling(message, clientSocket, clients, userIds);
                    return;
                }

            } catch (error) {
                console.error('Errore gestione messaggio:', error);
            }
        });

        clientSocket.on('close', async () => {
            clearInterval(pingInterval);

            const userId = userIds.get(clientSocket);

            if (userId) {
                clients.delete(userId);
                userIds.delete(clientSocket);

                await UpdatePresenceStatus(userId, 'OFFLINE');
                broadcastPresenceUpdate(userId, 'OFFLINE');
            }
        });

        clientSocket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    return wsServer;
}