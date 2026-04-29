//FEDERICA

import prisma from "../db/index";

export class ConversationModel {
  
  // Metodo per trovare conversazione tra due utenti tramite email
  static async findBetweenUsersByEmail(email1: string, email2: string) {
    return await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { user: { email: email1 } } } },
          { participants: { some: { user: { email: email2 } } } }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                surname: true,
                username: true,
                email: true,
                avatarUrl: true,
                presenceStatus: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            senderId: true,
            ciphertext: true,
            iv: true,
            tag: true,
            createdAt: true,
            isRead: true
          }
        }
      }
    });
  }

  // Metodo per creare conversazione tra due utenti tramite email
  static async createByEmails(email1: string, email2: string) {
    return await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { user: { connect: { email: email1 } } },
            { user: { connect: { email: email2 } } }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                surname: true,
                username: true,
                email: true,
                avatarUrl: true,
                presenceStatus: true
              }
            }
          }
        },
        messages: true
      }
    });
  }

  // Metodo per trovare tutte le conversazioni di un utente tramite email
  static async findByUserEmail(email: string) {
    return await prisma.conversation.findMany({
      where: {
        participants: {
          some: { user: { email } }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                surname: true,
                username: true,
                email: true,
                avatarUrl: true,
                presenceStatus: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            senderId: true,
            ciphertext: true,
            iv: true,
            tag: true,
            createdAt: true,
            isRead: true,
            sender: {
              select: {
                userId: true,
                name: true,
                surname: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}