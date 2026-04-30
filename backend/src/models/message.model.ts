//FEDERICA

import { PrismaClient } from '@prisma/client';;

const prisma = new PrismaClient();

// Classe per la gestione dei messaggi
export class MessageModel {
  static async create(senderId: number, conversationId: number, ciphertext: string, iv: Buffer, tag: Buffer) {
    return await prisma.message.create({
      data: {
        senderId,
        conversationId,
        ciphertext,
        iv: new Uint8Array(iv),
        tag: new Uint8Array(tag),
        keyId: 'k1',
        isRead: false,
      },
    });
  }

  // Metodo per recuperare messaggi di una conversazione con limite e includendo info mittente
  static async findByConversationId(conversationId: number, limit: number = 50) {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: {
            userId: true,
            name: true,
            surname: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  // Metodo per segnare un singolo messaggio come letto
  static async markAsRead(messageId: number) {
    return await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  // Metodo per segnare tutti i messaggi come letti in una conversazione per un utente specifico
  static async markAllAsReadInConversation(conversationId: number, userId: number) {
    return await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId }, // Solo messaggi ricevuti
        isRead: false
      },
      data: {
        isRead: true
      }
    });
  }

  // Metodo per recuperare l'ultimo messaggio di una conversazione
  static async getLastMessageByConversation(conversationId: number) {
    return await prisma.message.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}