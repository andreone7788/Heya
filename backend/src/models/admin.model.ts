import  prisma from "../db"
import bcrypt from "bcrypt";
import { TypeCreateUser, TypeRegister } from "../types/user.types";
import { generateRandomPassword } from "../utils/utils";

// definizione del tipo PendingUser (senza passwordHash)
type PendingUser = Omit<TypeRegister, 'password'> & { password: string, status: "ACTIVE" };

// query per la creazione di un nuovo utente
export const createUser = async (newUser: TypeCreateUser): Promise<PendingUser> => {
    const tempPassword = generateRandomPassword(6);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    const createdUser = await prisma.user.create({
        data: {
            name: newUser.name,
            surname: newUser.surname,
            username: newUser.username,
            email: newUser.email,
            passwordHash: passwordHash,
            address: newUser.address || null,
            phone: newUser.phone || null,
            status: "ACTIVE"
        }
    });
    return {
        name: createdUser.name,
        surname: createdUser.surname,
        username: createdUser.username,
        email: createdUser.email,
        password: tempPassword,
        address: createdUser.address || undefined,
        phone: createdUser.phone || undefined,
        status: "ACTIVE"
    };
};

// Query per approvare una richiesta di registrazione e creare l'utente
export const approveRegistrationRequest = async (requestId: number) => {
    const request = await prisma.userRegistrationRequest.findUnique({
        where: { id: requestId }
    });
    if (!request) throw new Error("Richiesta non trovata");

    // Genera password temporanea
    const tempPassword = generateRandomPassword(6);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const createdUser = await prisma.user.create({
        data: {
            name: request.name,
            surname: request.surname,
            username: request.username,
            email: request.email,
            address: request.address,
            phone: request.phone,
            status: "ACTIVE",
            passwordHash: passwordHash,
            registrationRequestId: request.id
        }
    });

    await prisma.userRegistrationRequest.delete({
        where: { id: requestId }
    });

    return {
        userId: createdUser.userId,
        email: createdUser.email,
        username: createdUser.username,
        password: tempPassword // <-- restituisci la password generata
    };
};

// Query per l'eliminazione di un utente
export const deleteUser = async (userId: number) => {
    await prisma.user.delete({
        where: {
            userId: userId
        }
    })
}

// Query per l'eliminazione di un utente
export const deleteUserPending = async (id: number) => {
    await prisma.userRegistrationRequest.delete({
        where: {
            id: id
        }
    })
}