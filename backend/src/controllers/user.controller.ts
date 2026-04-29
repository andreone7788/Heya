//FEDERICA - AGGIORNAMENTO PASSWORD

import { LoginQuery, CreatePendingUser, CheckDuplicateEmail, findUserById, UpdatePassword, UpdateAvatarUrl, UpdateUserProfile } from '../models/user.model';
import { sendMail } from '../services/mail/mail.services';
import { Request, Response } from 'express';
import { LoginSchema, RegisterSchema, UpdatePassSchema, UpdateProfileSchema } from '../types/user.types';
import z from 'zod';
import bcrypt from 'bcrypt'

// controller per il login
export const LoginController = async (req: Request, res: Response) => {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json(z.treeifyError(parseResult.error));
    }

    try {
        const user = await LoginQuery(parseResult.data)
        if (user !== null) {
            req.session.userId = user.userId;
            req.session.RoleSelected = user.RoleSelected;
            req.session.email = user.email;
            req.session.name = user.name
            req.session.surname = user.surname
            req.session.save();
            return res.status(200).json({ message: "Login successful" });
        }
    } catch (error) {
        return res.status(401).json({ error: "Authentication failed" })
    }
}

// Controller per il logout
export const LogoutController = async (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie('connect.sid',{
            secure:false
        }).json({ message: "Logout successful" });
    });
}

// controller per il check della sessione
export const CheckAuthController = async (req: Request, res: Response) => {
    if (!req.session.userId) {
        return res.status(401).json({ isAuth: false })
    }

    const user = await findUserById(req.session.userId);
    return res.status(200).json({ 
        isAuth: true,
        user: {
            userId: req.session.userId,
            email: req.session.email,
            name: req.session.name,
            surname: req.session.surname,
            role: req.session.RoleSelected === 'ADMIN' ? 'admin' : 'user',
            avatarUrl: user.avatarUrl || undefined
        }
    });
}

// Controller per la registrazione di un utente (pending)
export const RegisterController = async (req: Request, res: Response) => {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json(z.treeifyError(parseResult.error));
    }

    try {
        // Controllo duplicati
        const [isEmailDuplicate] = await Promise.all([
            CheckDuplicateEmail(parseResult.data.email),
        ]);

        if (isEmailDuplicate) {
            return res.status(409).json({ error: 'email già in uso' });
        }

        const pendingUser = await CreatePendingUser(parseResult.data);

        // Invio email admin (non bloccante)
        try {
            if (process.env.ADMIN_EMAIL) {
                await sendMail({
                    to: process.env.ADMIN_EMAIL,
                    subject: "Nuova registrazione in attesa di approvazione - Heya",
                    html: `<p>È stata effettuata una nuova registrazione con i seguenti dettagli:</p>
                           <ul>
                             <li><strong>Nome:</strong> ${pendingUser.name} ${pendingUser.surname}</li>
                             <li><strong>Username:</strong> ${pendingUser.username}</li>
                             <li><strong>Email:</strong> ${pendingUser.email}</li>
                             ${pendingUser.address ? `<li><strong>Indirizzo:</strong> ${pendingUser.address}</li>` : ''}
                             ${pendingUser.phone ? `<li><strong>Telefono:</strong> ${pendingUser.phone}</li>` : ''}
                           </ul>
                           <p>Accedi al pannello di amministrazione per approvare o rifiutare questa richiesta.</p>`
                });
            }
        } catch (emailError) {
            console.error("Errore invio email admin:", emailError);
            // Non bloccare la risposta
        }

        return res.status(201).json({ 
            message: "Registrazione completata. Attendi l'approvazione dell'amministratore." 
        });
    } catch (error) {
        console.error("Errore durante la registrazione:", error);
        return res.status(500).json({ 
            error: "Impossibile completare la registrazione" 
        });
    }
};



// Controller per l'aggiornamento della password
export const UpdatePasswordController = async(req:Request, res:Response)=> {
      
    const userData = UpdatePassSchema.safeParse(req.body)
    if (!userData.success) {
        return res.status(400).json(z.treeifyError(userData.error));
    }

     try {
        // Verifica che l'utente sia autenticato
        if (!req.session?.userId) {
            return res.status(401).json({ error: "Non autenticato" });
        }

        const { oldPassword, password } = req.body;
        const userId = req.session.userId;

        // Recupera l'utente dalla sessione, NON dalla richiesta
        const user = await findUserById(userId);
        
        if (!user) {
            return res.status(404).json({ error: "Utente non trovato" });
        }

        // Verifica la vecchia password
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isOldPasswordValid) {
            return res.status(400).json({ error: "Vecchia password non corretta" });
        }

        await UpdatePassword(userId, oldPassword, password);
        return res.status(200).json({ message: "Password aggiornata con successo" });
    } catch (err) {
        return res.status(500).json({ error: "Errore durante l'aggiornamento della password" });
    }
}

// Controller per il caricamento dell'avatar
export const UploadAvatarController = async (req: Request, res: Response) => {
    try {
        // Verifica autenticazione
        if (!req.session?.userId) {
            return res.status(401).json({ error: "Non autenticato" });
        }

        // Verifica che il file sia stato caricato
        if (!req.file) {
            return res.status(400).json({ error: "Nessun file caricato" });
        }

        const userId = req.session.userId;
        // Costruzione del percorso dell'avatar (url)
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Aggiornamento del percorso dell'avatar nel database
        await UpdateAvatarUrl(userId, avatarUrl);

        return res.status(200).json({
            message: "Avatar caricato con successo",
            avatarUrl: avatarUrl
        });
    } catch (err) {
        console.error("Errore durante il caricamento dell'avatar:", err);
        return res.status(500).json({ error: "Errore durante il caricamento dell'avatar" });
    }
}

// Controller per l'aggiornamento del profilo utente (dati facoltativi)
export const UpdateUserProfileController = async (req: Request, res: Response) => {
    const parseResult = UpdateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json(z.treeifyError(parseResult.error));
    }

    try {
        // Verifica autenticazione
        if (!req.session?.userId) {
            return res.status(401).json({ error: "Non autenticato" });
        }

        const userId = req.session.userId;
        await UpdateUserProfile(userId, parseResult.data);

        return res.status(200).json({ message: "Profilo aggiornato con successo" });
    } catch (err) {
        console.error("Errore durante l'aggiornamento del profilo:", err);
        return res.status(500).json({ error: "Errore durante l'aggiornamento del profilo" });
    }
}