import { findUserById, findUserPendingById, LoadPendingUser, LoadUser } from "../../models/user.model";
import { sendMail } from "../../services/mail/mail.services";
import { Request, Response } from "express";
import { TypeCreateUser, CreateUserSchema } from "../../types/user.types";
import { createUser, deleteUser, deleteUserPending } from "../../models/admin.model";
import { approveRegistrationRequest } from "../../models/admin.model";
import { CheckDuplicateEmail } from "../../models/user.model";
import z from "zod";

// Controller per ottenere la lista di tutti gli utenti (admin)
export const UserListController = async (req: Request, res: Response) => {
    try {
        const list = await LoadUser()

        return res.status(200).json(list)

    } catch (error) {
        return res.status(500).json({ message: 'errore nel recupero degli utenti' })
    }
}

// Controller per ottenere la lista di tutti gli utenti (admin)
export const UserListPendingController = async (req: Request, res: Response) => {
    try {
        const list = await LoadPendingUser()

        return res.status(200).json(list)

    } catch (error) {
        return res.status(500).json({ message: 'errore nel recupero degli utenti' })
    }
}

// controller per la creazione di un nuovo utente (admin)
export const CreateUserController = async (req: Request, res: Response) => {
    const parseResult = CreateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json(z.treeifyError(parseResult.error));
    }

    const newUser: TypeCreateUser = parseResult.data;

    try {
        const [isEmailDuplicate] = await Promise.all([
            CheckDuplicateEmail(parseResult.data.email),
        ]);

        if (isEmailDuplicate) {
            return res.status(409).json({
                error: "Email già in uso"
            });
        }
        const createdUser = await createUser(newUser);

        // ✅ Rispondi SUBITO
        res.status(201).json({ message: 'User created successfully', user: createdUser });

        // ✅ Email in background
        if (process.env.ADMIN_EMAIL) {
            sendMail({
                to: createdUser.email,
                subject: "Nuova registrazione attiva - Heya",
                html: `<p>È stata effettuata una nuova registrazione con i seguenti dettagli:</p>
                   <ul>
                     <li><strong>Nome:</strong> ${createdUser.name} ${createdUser.surname}</li>
                     <li><strong>Username:</strong> ${createdUser.username}</li>
                     <li><strong>Email:</strong> ${createdUser.email}</li>
                     ${createdUser.address ? `<li><strong>Indirizzo:</strong> ${createdUser.address}</li>` : ''}
                     ${createdUser.phone ? `<li><strong>Telefono:</strong> ${createdUser.phone}</li>` : ''}
                     <li><strong>Password Temporanea:</strong> ${createdUser.password}
                   </ul>
                   <a href='https://heya-sigma-nine.vercel.app'>Clicca qui per accedere</a>`
            }).then(() => {
                console.log("✅ Email benvenuto inviata a:", createdUser.email);
            }).catch(emailError => {
                console.error("❌ Errore invio email benvenuto:", emailError);
            });
        }
    } catch (error) {
        return res.status(500).json({ message: 'errore nella creazione dell\'utente' });
    }
};

// controller per l'eliminazione di un utente (admin)
export const DeleteUserController = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const user = await findUserById(userId);
        await deleteUser(userId);
        
        // ✅ Rispondi SUBITO
        res.status(204).end();
        
        // ✅ Email in background
        sendMail({
            to: user.email,
            subject: 'Account eliminato - Heya',
            html: `<h2>Il tuo account è stato eliminato</h2>
                   <p>Ciao ${user.username},</p>
                   <p>Il tuo account su Heya è stato eliminato.</p>
                   <p>Per ulteriori informazioni, contatta il supporto.</p>`
        }).catch(emailError => {
            console.error("❌ Errore invio email eliminazione:", emailError);
        });
    } catch (error) {
        console.error('DeleteUserController error:', error);
        return res.status(500).json({ message: 'errore nell\'eliminazione dell\'utente' });
    }
}

// Controller per l'approvazione di un utente pending (admin)
export const ApproveUserController = async (req: Request, res: Response) => {
    const requestId = Number(req.params.requestId);

    if (isNaN(requestId)) {
        return res.status(400).json({ error: "Dati non validi" });
    }

    try {
        const result = await approveRegistrationRequest(requestId);

        // ✅ Rispondi SUBITO
        res.status(200).json({ message: "Utente approvato con successo" });

        // ✅ Email in background
        sendMail({
            to: result.email,
            subject: 'Approvazione registrazione - Heya',
            html: `<h2>La tua registrazione è stata approvata!</h2>
                   <p>Ciao ${result.username},</p>
                   <p>La tua registrazione su Heya è stata approvata!</p>
                   <h3>Le tue credenziali di accesso:</h3>
                   <ul>
                     <li><strong>Email:</strong> ${result.email}</li>
                     <li><strong>Password temporanea:</strong> ${result.password}</li>
                   </ul>
                   <p><strong>Importante:</strong> Ti consigliamo di cambiare la password al primo accesso.</p>
                   <p>Benvenuto a bordo!</p>`
        }).then(() => {
            console.log("✅ Email approvazione inviata a:", result.email);
        }).catch(emailError => {
            console.error("❌ Errore invio email approvazione:", emailError);
        });

    } catch (error) {
        return res.status(400).json({ 
            error: error instanceof Error ? error.message : "Errore nell'approvazione dell'utente" 
        });
    }
};

// controller per l'eliminazione di un utente (admin)
export const DeleteUserPendingController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const user = await findUserPendingById(id);
        await deleteUserPending(id);
        
        // ✅ Rispondi SUBITO
        res.status(204).end();
        
        // ✅ Email in background
        sendMail({
            to: user.email,
            subject: 'Rigetto registrazione - Heya',
            html: `<h2>La tua registrazione è stata rigettata</h2>
                   <p>Ciao ${user.username},</p>
                   <p>Siamo spiacenti di informarti che la tua registrazione su Heya è stata rigettata.</p>
                   <p>Per ulteriori informazioni, contatta il supporto.</p>`
        }).catch(emailError => {
            console.error("❌ Errore invio email rigetto:", emailError);
        });
    } catch (error) {
        console.error('DeleteUserPendingController error:', error);
        return res.status(500).json({ message: 'errore nell\'eliminazione dell\'utente' });
    }
}
