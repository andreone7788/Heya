import dotenv from 'dotenv';
import express from 'express';
import expressSession from 'express-session';
import cors from 'cors';
import { logSession } from './middleware/auth';
import { router } from './routes/index';
import { Request, Response } from 'express';
import https from 'https';
import fs from 'fs';
import { initializeWebSocket } from './webSocket/webSocket.handler';

dotenv.config();

const app = express();

const server = https.createServer({
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem')
}, app);

const PORT = 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server WebSocket + Express')
})

app.use(cors({
    origin: 'https://localhost:5173', // ← Cambiato in https
    credentials: true
}));

app.use(express.json());

app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: true,
        httpOnly: true,
        sameSite: 'none'
    }
}));

app.use(logSession);

app.use('/uploads', express.static('uploads'));

router(app);

server.listen(PORT, async () => {
    console.log(`Server HTTPS avviato su https://localhost:${PORT}`);
    initializeWebSocket(server);
    console.log('WebSocket inizializzato');
});