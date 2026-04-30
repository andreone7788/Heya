import { TypeRegister, TypeLogin, TypeUser, TypeUpdatePassSchema, TypeUpdateProfileSchema, TypePendingSchema } from "../types/user.types";
import  prisma from "../db"
import bcrypt from "bcrypt";
import { PresenceStatus } from "@prisma/client";

// query per il login
export const LoginQuery = async (utenti: TypeLogin) => {
    const user = await prisma.user.findUnique({
        where: {
            email: utenti.email
        }
    });
    if (!user) {
        throw new Error("User not found");
    }

    if (!user.passwordHash) {
        throw new Error("Password not set for this user");
    }
    const passwordHash = await bcrypt.compare(utenti.password, user.passwordHash);
    if (passwordHash) {
        return user;
    } else {
        throw new Error("Invalid password");
    }
}

// query per ottenere tutti gli utenti active (gestione admin)
export const LoadUser = async():Promise<TypeUser[]> => {
    const List = await prisma.user.findMany({
        where: {
            RoleSelected: 'USER'
        }
    })

    if(!List){
        throw new Error("Can't load users list")
    } 

    return List.map(user => ({
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
}

// query per ottenere tutti gli utenti (gestione admin)
export const LoadPendingUser = async():Promise<TypePendingSchema[]> => {
    const List = await prisma.userRegistrationRequest.findMany()

    if(!List){
        throw new Error("Can't load users list")
    } 

    return List
}

// query per verifica email duplicata
export const CheckDuplicateEmail = async(email: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });
    return user !== null;
};

// Query per recupero utente da ID
export async function findUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: { userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
    return user;
}


// Query per recupero utente in stato "pending" da ID
export async function findUserPendingById(id: number) {
  const user = await prisma.userRegistrationRequest.findUnique({
    where: { id },
  });
  if (!user) {
    throw new Error("User not found");
  }
    return user;
}

// Query per registrazione nuovo utente (stato "pending" di default)
export const CreatePendingUser = async(user: TypeRegister): Promise<TypeRegister> => {
    const newRequest = await prisma.userRegistrationRequest.create({
        data: {
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            status: "PENDING",
            address: user.address || null,
            phone: user.phone || null
        }
    })
    return newRequest
}

// Query per aggiornare la password di un utente esistente
export const UpdatePassword = async(userId: number, oldPassword: string, newPassword: string) => {
    // Prima trova l'utente
    const existingUser = await prisma.user.findUnique({
        where: {
            userId: userId
        }
    });

    if (!existingUser) {
        throw new Error("User not found");
    }

    // Verifica la vecchia password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, existingUser.passwordHash);
    if (!isOldPasswordValid) {
        throw new Error("Old password is incorrect");
    }

    // Aggiorna con la nuova password
    await prisma.user.update({
        where: {
            userId: userId
        },
        data: {
            passwordHash: await bcrypt.hash(newPassword, 10)
        }
    });
}

// Query per aggiornare lo stato di presenza
export const UpdatePresenceStatus = async(userId: number, status: PresenceStatus) => {
    return await prisma.user.update({
        where: { userId },
        data: { presenceStatus: status }
    });
}

// Query per caricamento avatarurl
export const UpdateAvatarUrl = async(userId: number, avatarUrl: string) => {
    return await prisma.user.update({
        where: { userId },
        data: { avatarUrl }
    });
}

// Query per aggiornamento profilo
export const UpdateUserProfile = async(userId: number, data: TypeUpdateProfileSchema) => {
    // Rimuove campi undefined per evitare di sovrascrivere con null
    const updateData: Record<string, string> = {};

    if (data.username !== undefined) updateData.username = data.username;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;

    return await prisma.user.update({
        where: { userId },
        data: updateData
    });
}


