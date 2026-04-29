# 🚀 Deployment Guide - Heya!

## Pre-Deployment Checklist

### ✅ Requisiti Completati
- [x] Crittografia messaggi (AES-256-GCM)
- [x] WebSocket per real-time messaging
- [x] Videochiamate WebRTC
- [x] Admin panel
- [x] Sistema di presenza (ONLINE/OFFLINE/AWAY)
- [x] Separatori data nei messaggi
- [x] Internazionalizzazione IT/EN
- [x] Upload avatar
- [x] Email notifications

---

## 📦 Deployment su Railway (Backend + Database)

### Step 1: Preparazione Database
```bash
# Nel backend, esegui le migrations Prisma
npm run prisma:migrate
npm run prisma:generate
```

### Step 2: Railway Setup
1. Vai su [Railway.app](https://railway.app)
2. Crea un nuovo progetto
3. Aggiungi MySQL database
4. Aggiungi servizio Node.js
5. Collega la repository GitHub

### Step 3: Variabili d'Ambiente Railway
```env
DATABASE_URL=<railway-mysql-url>
SESSION_SECRET=<genera-random-string>
ENCRYPTION_KEY=<genera-con-node-crypto>
NODE_ENV=production
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=<tua-email@gmail.com>
MAIL_PASS=<app-password-google>
MAIL_FROM=Heya <tua-email@gmail.com>
ADMIN_EMAIL=<tua-email@gmail.com>
```

**Genera chiavi sicure**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Build Settings Railway
- **Build Command**: `cd backend && npm install && npx prisma generate && npm run build`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: `/`

### Step 5: Configurazione SSL per Produzione
Nel file `backend/src/index.ts`, modifica per gestire sia sviluppo che produzione:

```typescript
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
const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Heya! Server Running')
})

// CORS: adatta in base all'ambiente
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://your-vercel-app.vercel.app'
        : 'https://localhost:5173',
    credentials: true
}));

app.use(express.json());

app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.use(logSession);
app.use('/uploads', express.static('uploads'));
router(app);

// Crea server in base all'ambiente
if (process.env.NODE_ENV === 'development') {
    // Sviluppo locale con HTTPS self-signed
    const server = https.createServer({
        key: fs.readFileSync('./ssl/key.pem'),
        cert: fs.readFileSync('./ssl/cert.pem')
    }, app);
    
    server.listen(PORT, () => {
        console.log(`🔒 HTTPS Development server on https://localhost:${PORT}`);
        initializeWebSocket(server);
        console.log('✅ WebSocket inizializzato');
    });
} else {
    // Produzione: Railway gestisce SSL automaticamente
    const server = http.createServer(app);
    
    server.listen(PORT, () => {
        console.log(`🚀 Production server running on port ${PORT}`);
        initializeWebSocket(server);
        console.log('✅ WebSocket inizializzato');
    });
}
```

### Step 6: Aggiungi Variabile FRONTEND_URL
In Railway, aggiungi:
```env
FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

## 🌐 Deployment Frontend su Vercel

### Step 1: Build Configuration
```bash
cd frontend
npm run build
```

### Step 2: Vercel Setup
1. Vai su [Vercel.com](https://vercel.com)
2. Importa repository GitHub
3. Framework Preset: **Vite**
4. Root Directory: **frontend**

### Step 3: Variabili d'Ambiente Vercel
```env
VITE_API_URL=https://your-railway-app.railway.app/heya
VITE_WS_URL=wss://your-railway-app.railway.app
```

⚠️ **IMPORTANTE**: Sostituisci `your-railway-app` con il dominio reale di Railway!

### Step 4: Build Settings Vercel
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: `frontend`

### Step 5: Rimuovi SSL dal vite.config.ts per Produzione
Crea `frontend/vite.config.production.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  envDir: '.',
  server: {
    port: 5173
  }
})
```

Oppure modifica `frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  envDir: '.',
  server: {
    port: 5173,
    // SSL solo in sviluppo locale
    ...(process.env.NODE_ENV !== 'production' && {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, '../backend/ssl/key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, '../backend/ssl/cert.pem'))
      }
    })
  }
})
```

---

## 🔐 Gestione Upload Avatar

⚠️ **IMPORTANTE**: Railway usa filesystem effimero! I file upload vanno persi al riavvio.

### Soluzione: Cloudinary (Raccomandato)

#### 1. Crea Account Cloudinary
- Vai su [Cloudinary](https://cloudinary.com)
- Registrati (piano gratuito: 25 GB storage, 25 GB bandwidth/mese)
- Ottieni le credenziali dal dashboard

#### 2. Installa SDK
```bash
cd backend
npm install cloudinary
npm install @types/cloudinary --save-dev
```

#### 3. Configura Cloudinary
Crea `backend/src/config/cloudinary.ts`:
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
```

#### 4. Aggiorna upload.ts
```typescript
import multer from 'multer';

// Usa memoria invece di disco
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
};

export const uploadAvatar = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('avatar');
```

#### 5. Aggiorna User Controller
Nel file che gestisce l'upload (es. `user.controller.ts`):
```typescript
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

export const uploadAvatarController = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload su Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'heya_avatars',
                public_id: `user_${req.session.userId}_${Date.now()}`,
                transformation: [
                    { width: 400, height: 400, crop: 'fill' },
                    { quality: 'auto' }
                ]
            },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ error: 'Upload failed' });
                }

                // Salva URL nel database
                await prisma.user.update({
                    where: { userId: req.session.userId },
                    data: { avatarUrl: result!.secure_url }
                });

                res.json({ avatarUrl: result!.secure_url });
            }
        );

        // Converti Buffer in Stream per Cloudinary
        const bufferStream = Readable.from(req.file.buffer);
        bufferStream.pipe(uploadStream);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
};
```

#### 6. Aggiungi Variabili Railway
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🧪 Test Pre-Deployment

### Backend Tests
```bash
cd backend

# Verifica build TypeScript
npm run build

# Verifica Prisma
npm run prisma:generate

# Testa localmente
npm run dev
```

### Frontend Tests
```bash
cd frontend

# Build produzione
npm run build

# Preview build locale
npm run preview
```

---

## 🔒 Sicurezza

### Checklist Sicurezza
- [x] `.env` in `.gitignore`
- [x] Password hashate con bcrypt
- [x] Session secrets casuali e lunghi
- [x] HTTPS in produzione (Railway lo gestisce)
- [x] CORS configurato per dominio specifico
- [x] Messaggi criptati nel database
- [x] Cookie sicuri (HttpOnly, Secure in prod, SameSite)
- [x] Validazione input con Zod
- [x] File upload limitati (tipo e dimensione)

### CORS Produzione Sicuro
Aggiorna `backend/src/index.ts`:
```typescript
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, 'https://your-vercel-app.vercel.app']
    : ['https://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
```

---

## 📊 Monitoring & Logs

### Railway Logs
```bash
# Installa Railway CLI
npm install -g @railway/cli

# Login
railway login

# View logs in tempo reale
railway logs
```

### Vercel Logs
- Dashboard Vercel → Deployments → View Function Logs
- Attiva Vercel Analytics per metriche dettagliate

---

## 🐛 Troubleshooting Comune

### ❌ WebSocket connection failed
**Problema**: WebSocket non si connette in produzione  
**Soluzione**:
- Verifica URL sia `wss://` (non `ws://`)
- Railway supporta WebSocket nativamente
- Controlla che `VITE_WS_URL` sia corretto in Vercel

### ❌ Database connection error
**Problema**: Backend non si connette a MySQL  
**Soluzione**:
- Verifica `DATABASE_URL` in Railway
- Esegui migrations: `railway run npx prisma migrate deploy`
- Controlla logs: `railway logs`

### ❌ CORS errors
**Problema**: Frontend non può chiamare API backend  
**Soluzione**:
- Verifica `FRONTEND_URL` in Railway
- Controlla CORS origin in `index.ts`
- Assicurati che `credentials: true` sia presente

### ❌ Upload avatar fallito
**Problema**: Avatar non vengono salvati  
**Soluzione**:
- Se usi filesystem: passa a Cloudinary (filesystem Railway è effimero)
- Verifica credenziali Cloudinary in Railway
- Controlla dimensione file < 5MB

### ❌ Email non inviate
**Problema**: Notifiche email non arrivano  
**Soluzione**:
- Usa Google App Password (non password account)
- Verifica `MAIL_USER` e `MAIL_PASS` in Railway
- Controlla spam folder
- Test con: `railway run node -e "require('./dist/services/mail').sendTestEmail()"`

### ❌ Session cookie not working
**Problema**: Logout automatico o sessione non persiste  
**Soluzione**:
- In produzione: `cookie.secure = true`
- `cookie.sameSite = 'none'` per cross-origin
- Verifica `SESSION_SECRET` sia impostato

---

## 📝 Post-Deployment

### 1. Test Completo Produzione
- ✅ Registrazione nuovo utente
- ✅ Email di notifica ricevuta
- ✅ Login/Logout
- ✅ Chat in tempo reale
- ✅ Upload avatar
- ✅ Videochiamata
- ✅ Admin panel
- ✅ Cambio lingua IT/EN
- ✅ Status AWAY automatico

### 2. Configurazione DNS (Opzionale)
**Railway**:
- Settings → Domains → Add Custom Domain
- Aggiungi record CNAME nel tuo DNS provider

**Vercel**:
- Settings → Domains → Add Domain
- Segui istruzioni per configurare DNS

### 3. Backup Database
```bash
# Esporta schema
railway run npx prisma db pull

# Seed iniziale (se necessario)
railway run npx prisma db seed
```

### 4. Monitoring Setup
- **Railway**: Dashboard → Metrics
- **Vercel**: Dashboard → Analytics
- **Opzionale**: Sentry per error tracking

---

## 🎯 Checklist Finale

Prima di dichiarare il deployment completo:

- [ ] Backend online su Railway
- [ ] Database MySQL creato e migrato
- [ ] Frontend online su Vercel
- [ ] Variabili d'ambiente configurate (entrambi)
- [ ] CORS configurato correttamente
- [ ] WebSocket funzionante
- [ ] Upload avatar funziona (Cloudinary)
- [ ] Email notifiche funzionano
- [ ] SSL/HTTPS attivo (automatico)
- [ ] Test chat real-time OK
- [ ] Test videochiamata OK
- [ ] Admin panel accessibile
- [ ] Nessun errore nei logs

---

## 🎉 Deployment Completato!

La tua app Heya! è ora live! 🚀

**Indirizzi**:
- 🌐 Frontend: `https://your-app.vercel.app`
- 🔌 Backend API: `https://your-app.railway.app`
- 👑 Admin Panel: `https://your-app.vercel.app/HeyaAdmin`

**Credenziali Primo Admin**:
Dopo il primo deploy, crea un utente admin direttamente nel database:
```sql
-- Connetti a Railway MySQL
UPDATE User SET status = 'ACTIVE', RoleSelected = 'ADMIN' WHERE email = 'tua-email@example.com';
```

**Next Steps**:
- 📊 Monitora logs e performance
- 🐛 Fix eventuali bug post-deployment
- 📸 Aggiungi screenshot al README
- ⭐ Condividi su GitHub/LinkedIn/Portfolio!

---

## 📞 Support

Per problemi di deployment:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Cloudinary Docs: https://cloudinary.com/documentation

**Buon deployment!** 🎊
