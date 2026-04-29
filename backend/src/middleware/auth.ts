import { Request, Response, NextFunction } from 'express';

// Middleware per logsession
export const logSession = (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Session.Data:', req.session);
    }
    next();
};

// Middleware per l'autenticazione
export const authLogin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
        return res.status(401).json({ Authenticated: false })
    }
    next();
}

// Middleware per l'autenticazione admin
export const authAdmin = (req:Request, res:Response, next: NextFunction) => {
    if(!req.session.userId){
        return res.status(401).json({ Authenticated: false })
    }
    if(req.session.RoleSelected !== "ADMIN"){
         return res.status(403).json({ error: 'Accesso negato: solo admin' })
    }
    next();
    
}

