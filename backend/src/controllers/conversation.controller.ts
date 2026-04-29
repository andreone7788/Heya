//FEDERICA

import { Request, Response } from 'express';
import { MessageModel } from '../models/message.model';
import { ConversationModel } from '../models/conversation.model';
import { encryptMessage, decryptMessage } from '../utils/crypto.utils';
import prisma from '../db';
import { conversationPartecipantModel } from '../models/converstation.partecipant.model';

// ===== FUNZIONI UTILITY (usate da WebSocket - mantengono userId per performance) =====

// Salva un messaggio criptato
export const saveMessage = async (senderId: number, conversationId: number, content: string) => {
  try {
    const { ciphertext, iv, tag } = encryptMessage(content);
    const message = await MessageModel.create(senderId, conversationId, ciphertext, iv, tag);
    return message;
  } catch (error) {
    console.error('Errore nel salvataggio del messaggio:', error);
    throw error;
  }
};

// Trova o crea una conversazione tra due utenti (WebSocket usa userId per performance)
export const getOrCreateConversation = async (userId1: number, userId2: number) => {
  try {
    // Trova email dagli userId
    const user1 = await prisma.user.findUnique({ where: { userId: userId1 }, select: { email: true } });
    const user2 = await prisma.user.findUnique({ where: { userId: userId2 }, select: { email: true } });

    if (!user1 || !user2) {
      throw new Error("Utenti non trovati");
    }

    const existingConversation = await ConversationModel.findBetweenUsersByEmail(user1.email, user2.email);

    if (existingConversation && existingConversation.participants.length === 2) {
      return existingConversation;
    }

    const newConversation = await ConversationModel.createByEmails(user1.email, user2.email);
    return newConversation;
  } catch (error) {
    console.error('Errore nella gestione conversazione:', error);
    throw error;
  }
};

// ===== CONTROLLERS HTTP =====

// GET /conversations - Usa email dell'utente loggato
export const getUserConversationsController = async (req: Request, res: Response) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Non autenticato" });
    }

    // Trova email dell'utente loggato
    const user = await prisma.user.findUnique({ 
      where: { userId: req.session.userId },
      select: { email: true }
    });

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    const conversations = await ConversationModel.findByUserEmail(user.email);

    const conversationsWithDecryptedMessages = conversations.map(conv => {
      const lastMessage = conv.messages[0];
      if (lastMessage) {
        try {
          // ✅ FIX: iv e tag sono già Buffer da Prisma
          const iv = lastMessage.iv instanceof Buffer ? lastMessage.iv : Buffer.from(lastMessage.iv);
          const tag = lastMessage.tag instanceof Buffer ? lastMessage.tag : Buffer.from(lastMessage.tag);

          return {
            ...conv,
            messages: [{
              ...lastMessage,
              content: decryptMessage(lastMessage.ciphertext, iv, tag),
            }],
          };
        } catch (decryptError) {
          console.error(`❌ Errore decrittazione messaggio ${lastMessage.id}:`, decryptError);
          // Ritorna conversazione senza ultimo messaggio se la decrittazione fallisce
          return { ...conv, messages: [] };
        }
      }
      return conv;
    });

    res.json(conversationsWithDecryptedMessages);
  } catch (error) {
    console.error('❌ Errore recupero conversazioni:', error);
    res.status(500).json({ error: 'Errore nel recupero conversazioni' });
  }
};

// GET /conversations/between/:email1/:email2 - Trova o crea conversazione tra due utenti
export const getOrCreateConversationByEmailsController = async (req: Request, res: Response) => {
  try {
    const { email1, email2 } = req.params;

    if (!req.session?.userId) {
      return res.status(401).json({ error: "Non autenticato" });
    }

    if (!email1 || !email2) {
      return res.status(400).json({ error: "Email mancanti" });
    }

    // Trova email dell'utente loggato
    const currentUser = await prisma.user.findUnique({
      where: { userId: req.session.userId },
      select: { email: true }
    });

    // Verifica che l'utente loggato sia uno dei due
    if (!currentUser || (currentUser.email !== email1 && currentUser.email !== email2)) {
      return res.status(403).json({ error: "Non autorizzato" });
    }

    // Cerca conversazione esistente tramite Model
    let conversation = await ConversationModel.findBetweenUsersByEmail(email1, email2);

    // Se non esiste, creala tramite Model
    if (!conversation) {
      conversation = await ConversationModel.createByEmails(email1, email2);
    }

    res.json(conversation);
  } catch (error) {
    console.error('❌ Errore recupero/creazione conversazione:', error);
    res.status(500).json({ error: 'Errore nel recupero conversazione' });
  }
};

// GET /conversations/:conversationId/messages
export const getConversationMessagesController = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!req.session?.userId) {
      return res.status(401).json({ error: "Non autenticato" });
    }

    if (!conversationId || isNaN(parseInt(conversationId))) {
      return res.status(400).json({ error: "ID conversazione non valido" });
    }

    const conversationIdNum = parseInt(conversationId);

    // ✅ AGGIUNGI: Verifica che l'utente sia partecipante della conversazione
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        userId: req.session.userId,
        conversationId: conversationIdNum
      }
    });

    if (!isParticipant) {
      console.warn(`⚠️ Utente ${req.session.userId} non autorizzato per conversazione ${conversationIdNum}`);
      return res.status(403).json({ error: "Non autorizzato ad accedere a questa conversazione" });
    }

    const messages = await MessageModel.findByConversationId(conversationIdNum, limit);

    // ✅ FIX: iv e tag sono già Buffer da Prisma - non usare Buffer.from()
    const decryptedMessages = messages.map(msg => {
      try {
        // Gestisce sia Buffer che Uint8Array
        const iv = msg.iv instanceof Buffer ? msg.iv : Buffer.from(msg.iv);
        const tag = msg.tag instanceof Buffer ? msg.tag : Buffer.from(msg.tag);

        return {
          id: msg.id,
          senderId: msg.senderId,
          sender: msg.sender,
          content: decryptMessage(msg.ciphertext, iv, tag),
          createdAt: msg.createdAt,
          isRead: msg.isRead,
        };
      } catch (decryptError) {
        console.error(`❌ Errore decrittazione messaggio ${msg.id}:`, decryptError);
        // Ritorna messaggio con contenuto vuoto se fallisce la decrittazione
        return {
          id: msg.id,
          senderId: msg.senderId,
          sender: msg.sender,
          content: '[Messaggio non decifrabile]',
          createdAt: msg.createdAt,
          isRead: msg.isRead,
        };
      }
    });

    res.json(decryptedMessages.reverse());
  } catch (error) {
    console.error('❌ Errore recupero messaggi:', error);
    res.status(500).json({ error: 'Errore nel recupero messaggi' });
  }
};

// PUT /conversations/messages/:messageId/read
export const markAsReadController = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    if (!req.session?.userId) {
      return res.status(401).json({ error: "Non autenticato" });
    }

    if (!messageId || isNaN(parseInt(messageId))) {
      return res.status(400).json({ error: 'ID messaggio non valido' });
    }
    
    await MessageModel.markAsRead(parseInt(messageId));
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Errore aggiornamento lettura messaggio:', error);
    res.status(500).json({ error: "Errore nell'aggiornamento" });
  }
};

// PUT /conversations/:conversationId/mark-read
export const markConversationAsReadController = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (!req.session?.userId) {
      return res.status(401).json({ error: "Non autenticato" });
    }

    if (!conversationId || isNaN(parseInt(conversationId))) {
      return res.status(400).json({ error: 'ID conversazione non valido' });
    }
    
    await MessageModel.markAllAsReadInConversation(parseInt(conversationId), req.session.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Errore aggiornamento messaggi conversazione:', error);
    res.status(500).json({ error: "Errore aggiornamento messaggi" });
  }
};

// GET /conversations/unread
export const getUnreadCountsController = async (req: Request, res: Response) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Non autenticato" });
    }

    const userId = req.session.userId;
    
    const participants = await conversationPartecipantModel(userId);
    
    const unread: Record<number, number> = {};
    
    participants.forEach(p => {
      const otherParticipants = p.conversation?.participants;
      const unreadMessages = p.conversation?.messages;
      
      // Check aggiuntivo per evitare errori
      if (otherParticipants && otherParticipants.length > 0 && 
          unreadMessages && unreadMessages.length > 0 &&
          otherParticipants[0] && otherParticipants[0].userId) {
        const otherUserId = otherParticipants[0].userId;
        unread[otherUserId] = unreadMessages.length;
      }
    });
    
    res.json(unread);
  } catch (error) {
    console.error('❌ Errore caricamento badge:', error);
    res.status(500).json({ error: 'Errore caricamento badge' });
  }
};