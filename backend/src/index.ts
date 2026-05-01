import dotenv from 'dotenv';
import express from 'express';
import expressSession from 'express-session';
import cors from 'cors';
import { logSession } from './middleware/auth';
import { router } from './routes/index';
import { Request, Response } from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import { initializeWebSocket } from './webSocket/webSocket.handler';

dotenv.config();

const app = express();

// ✅ Usa HTTPS in development, HTTP in production
const isDevelopment = process.env.NODE_ENV !== 'production';
let server: http.Server | https.Server;

if (isDevelopment) {
    // Development: usa certificati SSL self-signed
    server = https.createServer({
        key: fs.readFileSync('./ssl/key.pem'),
        cert: fs.readFileSync('./ssl/cert.pem')
    }, app);
} else {
    // Production: HTTP normale (Railway gestisce HTTPS)
    server = http.createServer(app);
}

// ✅ Porta dinamica per Railway
const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server WebSocket + Express')
})

// ✅ CORS configurato per production e development
const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, 'https://localhost:5173']
    : ['https://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Permetti richieste senza origin (mobile apps, Postman, ecc.)
        if (!origin) {
            return callback(null, true);
        }
        
        // Permetti origini nella whitelist
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Permetti tutti i domini Vercel del progetto heya
        if (origin.includes('heya') && origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        
        // Blocca tutto il resto
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());

app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false, // ✅ Cambiato da true a false
    cookie: { 
        secure: true, // ✅ Sempre true in production (Railway usa HTTPS)
        httpOnly: true,
        sameSite: 'none', // ✅ Necessario per cross-site
        maxAge: 24 * 60 * 60 * 1000 // ✅ 24 ore
    },
    proxy: true // ✅ IMPORTANTE: Railway è dietro un proxy
}));

app.use(logSession);

app.use('/uploads', express.static('uploads'));

router(app);

server.listen(PORT, async () => {
    const protocol = isDevelopment ? 'https' : 'http';
    console.log(`Server ${protocol.toUpperCase()} avviato su ${protocol}://localhost:${PORT}`);
    initializeWebSocket(server as http.Server);
    console.log('WebSocket inizializzato');
});