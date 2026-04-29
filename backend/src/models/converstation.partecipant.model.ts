//FEDERICA

import prisma from "../db/index"
import { TypeUser } from "../types/user.types"


// Query per ottenere tutti gli utenti del db
export const getAllUsers = async (): Promise<TypeUser[]> => {
    const users = await prisma.user.findMany({
        where: {
            status: "ACTIVE",
            RoleSelected: 'USER'
        },
        select: {
            userId: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            status: true,
            presenceStatus: true,
            address: true,
            phone: true,
            avatarUrl: true
        }
    });

    return users.map(user => ({
        userId: user.userId,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        status: user.status as "PENDING" | "ACTIVE",
        presence: user.presenceStatus.toLowerCase() as "online" | "offline" | "away",
        address: user.address || undefined,
        phone: user.phone || undefined,
        avatar: user.avatarUrl || undefined
    }))
};

// Query per ottenere info utente per chat (con presenza in tempo reale)
export const getUserForChat = async (userId: number) => {
    return await prisma.user.findUnique({
        where: { userId },
        select: {
            userId: true,
            name: true,
            surname: true,
            username: true,
            avatarUrl: true,
            presenceStatus: true,
            statusMessage: true
        }
    });
};

// Query per ottenere utente tramite email
export const getUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where: { email },
        select: {
            userId: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            avatarUrl: true,
            presenceStatus: true,
            statusMessage: true
        }
    });
};

// Trova tutte le conversazioni con conteggio messaggi non letti
  export const conversationPartecipantModel= async(userId: number) => {
    return await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: userId } },
              select: { userId: true }
            },
            messages: {
              where: {
                senderId: { not: userId },
                isRead: false
              }
            }
          }
        }
      }
    });
  }
