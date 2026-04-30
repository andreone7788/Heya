import dotenv from 'dotenv';
import express from 'express';
import expressSession from 'express-session';
import cors from 'cors';
import { logSession } from './middleware/auth';
import { router } from './routes/index';
import { Request, Response } from 'express';
import https from 'https';
import http from 'http'; // ✅ Aggiungi import
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
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());

app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: !isDevelopment, // ✅ secure=true solo in production
        httpOnly: true,
        sameSite: isDevelopment ? 'lax' : 'none'
    }
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