//FEDERICA

import { Request, Response } from 'express';
import { getAllUsers, getUserForChat, getUserByEmail } from '../models/converstation.partecipant.model';

// Recupera tutti gli utenti attivi per lista contatti
export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Non autenticato" });
    }

    const users = await getAllUsers();
    
    // Escludi l'utente corrente dalla lista
    const filteredUsers = users.filter(user => user.userId !== req.session.userId);
    
    res.json(filteredUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero utenti' });
  }
};

// Recupera utente tramite email
export const getUserByEmailController = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!req.session?.userId) {
      return res.status(401).json({ error: "Non autenticato" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email non valida" });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero utente' });
  }
};

// Recupera info specifiche di un utente per chat
export const getUserForChatController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!req.session?.userId) {
      return res.status(401).json({ error: "Non autenticato" });
    }

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: "ID utente non valido" });
    }

    const user = await getUserForChat(parseInt(userId));

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero utente' });
  }
};