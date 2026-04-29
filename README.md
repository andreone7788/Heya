# Heya! - Real-Time Encrypted Chat & Video Call Application

<p align="center">
  <img src="./public/heya_logo.svg" alt="Heya! Logo" width="200"/>
</p>

> **Heya!** — Un'applicazione di messaggistica in tempo reale con crittografia end-to-store, videochiamate WebRTC e pannello di amministrazione.
>
> **Heya!** — A real-time messaging application with end-to-store encryption, WebRTC video calls, and an admin management panel.

---

## Indice / Table of Contents

- [Italiano](#italiano)
- [English](#english)

---

# Italiano

## Descrizione

**Heya!** e' un'applicazione di messaggistica istantanea full-stack progettata per la comunicazione sicura in tempo reale. L'applicazione offre chat crittografate con AES-256-GCM, videochiamate peer-to-peer tramite WebRTC, gestione della presenza utente (online/offline/assente) e un pannello di amministrazione completo per la gestione degli utenti.

Il progetto e' stato sviluppato da **AndreOne & Dami** come parte di un corso di sviluppo web.

## Funzionalita'

### Messaggistica in Tempo Reale
- Chat private tra utenti tramite WebSocket
- Crittografia AES-256-GCM per tutti i messaggi salvati nel database
- Indicatore di messaggi non letti per ogni contatto
- Selezione emoji integrata nel campo di input
- Scroll automatico ai messaggi piu' recenti
- Deduplicazione dei messaggi (WebSocket e API REST)

### Videochiamate WebRTC
- Chiamate video e audio peer-to-peer
- Attraversamento NAT tramite server STUN di Google
- Fallback automatico alla sola modalita' audio se la webcam non e' disponibile
- Interfaccia con video remoto a schermo intero e video locale Picture-in-Picture
- Modale di chiamata in arrivo con pulsanti accetta/rifiuta
- Gestione degli stati: squillo, attiva, terminata

### Sistema di Autenticazione
- Autenticazione basata su sessione con cookie sicuri (HttpOnly, Secure, SameSite)
- Hashing delle password con bcrypt (10 round)
- Controllo di accesso basato sui ruoli (ADMIN / USER)
- Rotte protette sia lato server (middleware) che lato client (React Router)

### Pannello di Amministrazione
- Visualizzazione degli utenti attivi tramite tabella MUI DataGrid
- Creazione diretta di nuovi utenti (con password temporanea generata automaticamente)
- Gestione delle richieste di registrazione in sospeso (approvazione/rifiuto)
- Notifiche email automatiche per registrazione, approvazione, rifiuto e credenziali

### Gestione del Profilo Utente
- Modifica del nome utente, telefono e indirizzo
- Upload dell'avatar (max 5MB, formati JPEG/PNG/GIF)
- Cambio password (richiede la vecchia password)

### Presenza Utente
- Stato di presenza in tempo reale: Online, Offline, Assente
- Indicatori colorati nella lista contatti (verde/arancione/rosso)
- Aggiornamento automatico alla connessione e disconnessione del WebSocket

### Internazionalizzazione
- Supporto completo bilingue Italiano / Inglese
- Toggle della lingua nell'header (IT / EN)
- Preferenza salvata nel localStorage del browser

## Stack Tecnologico

### Backend

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| Node.js | 25.2+ | Runtime JavaScript |
| Express | 5.2 | Framework HTTP |
| TypeScript | 5.9 | Linguaggio tipizzato |
| Prisma | 6.19 | ORM per database |
| MySQL | - | Database relazionale |
| WebSocket (ws) | 8.18 | Messaggistica in tempo reale |
| Zod | 4.1 | Validazione degli input |
| bcrypt | 6.0 | Hashing delle password |
| Nodemailer | 7.0 | Invio email SMTP |
| Multer | 2.0 | Upload di file |
| Node.js crypto | (built-in) | Crittografia AES-256-GCM |

### Frontend

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| React | 19.2 | Libreria UI |
| TypeScript | ~5.9 | Linguaggio tipizzato |
| Vite | 7.2 | Build tool e dev server |
| MUI (Material UI) | 7.3 | Componenti UI |
| MUI X DataGrid | 8.22 | Tabelle dati per pannello admin |
| React Router | 7.10 | Routing lato client |
| i18next | 25.7 | Internazionalizzazione |
| Zod | 4.2 | Validazione degli schemi |
| emoji-picker-react | 4.16 | Selettore emoji |

## Architettura

### Struttura del Progetto

```
Heya/
├── backend/
│   ├── prisma/                    # Schema del database e migrazioni
│   │   └── schema.prisma
│   ├── src/
│   │   ├── index.ts               # Entry point del server HTTPS
│   │   ├── controllers/           # Logica di business
│   │   │   ├── user.controller.ts
│   │   │   ├── conversation.controller.ts
│   │   │   ├── conversation.partecipant.controller.ts
│   │   │   └── admin/
│   │   │       └── management.controller.ts
│   │   ├── models/                # Query al database (Prisma)
│   │   │   ├── user.model.ts
│   │   │   ├── admin.model.ts
│   │   │   ├── conversation.model.ts
│   │   │   ├── converstation.partecipant.model.ts
│   │   │   └── message.model.ts
│   │   ├── routes/                # Definizione degli endpoint API
│   │   │   ├── index.ts
│   │   │   ├── user.route.ts
│   │   │   ├── conversation.route.ts
│   │   │   ├── conversation.partecipant.route.ts
│   │   │   └── admin/
│   │   │       └── management.routes.ts
│   │   ├── middleware/            # Autenticazione e upload
│   │   │   ├── auth.ts
│   │   │   └── upload.ts
│   │   ├── services/              # Servizi (email, chiamate)
│   │   │   ├── call.service.ts
│   │   │   └── mail/
│   │   │       ├── mail.services.ts
│   │   │       └── transporter.ts
│   │   ├── types/                 # Schemi Zod e tipi TypeScript
│   │   ├── utils/                 # Crittografia e utility
│   │   └── webSocket/            # Handler WebSocket e WebRTC
│   │       ├── webSocket.handler.ts
│   │       └── webrtc.handler.ts
│   ├── ssl/                       # Certificati SSL self-signed
│   └── uploads/avatars/           # Avatar degli utenti
│
├── frontend/
│   ├── public/                    # Asset statici (logo, font)
│   └── src/
│       ├── main.tsx               # Entry point React
│       ├── App.tsx                # Componente root con routing
│       ├── api/                   # Client API (fetch + Zod)
│       ├── components/            # Componenti riutilizzabili
│       │   ├── header.tsx         # Navbar con toggle lingua
│       │   ├── callModal.tsx      # UI per videochiamate
│       │   ├── createModal.tsx    # Modale creazione utente
│       │   ├── deleteModal.tsx    # Modale eliminazione utente
│       │   └── approveUserModal.tsx # Modale approvazione utente
│       ├── context/               # React Context (Auth, WebSocket)
│       ├── hooks/                 # Custom hooks (useAuth, useWebRTC)
│       ├── lang/                  # File di traduzione (it.json, en.json)
│       ├── pages/                 # Pagine dell'applicazione
│       │   ├── login.page.tsx
│       │   ├── registrationUser.page.tsx
│       │   ├── chat.page.tsx
│       │   ├── profile.page.tsx
│       │   ├── adminUser.page.tsx
│       │   └── notFound.tsx
│       ├── provider/              # Provider di stato globale
│       ├── routes/                # Guardie di rotta
│       └── types/                 # Schemi Zod e tipi condivisi
```

### Schema del Database

Il database MySQL e' composto da 5 tabelle principali:

- **User** — Account utente con ruolo (ADMIN/USER), stato di presenza e avatar
- **UserRegistrationRequest** — Richieste di registrazione in attesa di approvazione
- **Conversation** — Container delle conversazioni
- **ConversationParticipant** — Tabella di associazione utente-conversazione
- **Message** — Messaggi crittografati (ciphertext AES-256-GCM, IV, tag di autenticazione)

### Endpoint API

Tutte le API sono esposte sotto il prefisso `/heya`:

| Gruppo | Percorso Base | Autenticazione |
|---|---|---|
| Utente | `/heya/user` | Mista (login/registrazione pubblici) |
| Amministrazione | `/heya/management` | Solo admin |
| Conversazioni | `/heya/conversations` | Utenti autenticati |
| Contatti | `/heya/contacts` | Utenti autenticati |

### Rotte dell'Applicazione Frontend

| Percorso | Pagina | Accesso |
|---|---|---|
| `/` | Login | Pubblico |
| `/register` | Registrazione | Pubblico |
| `/HeyaChat` | Chat | Utenti autenticati |
| `/HeyaProfile` | Profilo | Utenti autenticati |
| `/HeyaManagementUser` | Gestione utenti attivi | Solo admin |
| `/HeyaManagementRequest` | Gestione richieste | Solo admin |

## Installazione e Avvio

### Prerequisiti
- Node.js v25.2 o superiore
- MySQL
- Certificati SSL (self-signed per sviluppo, presenti in `backend/ssl/`)

### 1. Clonare il repository
```bash
git clone https://github.com/ItsDamiArt/Heya.git
cd Heya
```

### 2. Configurare il Backend
```bash
cd backend
npm install
```

Creare un file `.env` nella cartella `backend/` con le seguenti variabili:
```env
DATABASE_URL="mysql://utente:password@localhost:3306/heya"
SESSION_SECRET="la_tua_chiave_segreta_di_sessione"
ENCRYPTION_KEY="chiave_esadecimale_32_byte"

MAIL_HOST="smtp.esempio.com"
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER="la_tua_email"
MAIL_PASS="la_tua_password_email"
MAIL_ADMIN="email_admin@esempio.com"
```

Eseguire le migrazioni del database:
```bash
npx prisma migrate dev
npx prisma generate
```

Avviare il server backend:
```bash
npm run dev
```
Il server HTTPS sara' disponibile su `https://localhost:3000`.

### 3. Configurare il Frontend
```bash
cd frontend
npm install
```

Avviare il server di sviluppo:
```bash
npm run dev
```
L'applicazione sara' disponibile su `https://localhost:5173`.

## Design e UI

L'applicazione utilizza una palette di colori calda ed elegante:

| Colore | Valore Hex | Utilizzo |
|---|---|---|
| Brown | `#221613` | Testo principale, sfondi scuri |
| Camel | `#72473d` | Accenti, pulsanti primari |
| White | `#ece9e1` | Sfondi chiari |
| Beige | `#b49d94` | Elementi secondari |
| Dove | `#8d8284` | Testo secondario |
| Ivory | `#dac4b9` | Sfondi delle card |

- Font personalizzato: **Satoshi Variable**
- Design arrotondato e moderno (borderRadius: 50px/30px)
- Layout responsivo con breakpoint a 870px (mobile/desktop)
- Componenti MUI personalizzati con proprietà `sx` per coerenza stilistica

## Autori

**AndreOne & Dami**

---
---

# English

## Description

**Heya!** is a full-stack instant messaging application designed for secure real-time communication. The application features AES-256-GCM encrypted chats, peer-to-peer video calls via WebRTC, user presence management (online/offline/away), and a comprehensive admin panel for user management.

The project was developed by **AndreOne & Dami** as part of a web development course.

## Features

### Real-Time Messaging
- Private chat between users via WebSocket
- AES-256-GCM encryption for all messages stored in the database
- Unread message badges per contact
- Integrated emoji picker in the message input
- Auto-scroll to the latest messages
- Message deduplication (WebSocket and REST API)

### WebRTC Video Calls
- Peer-to-peer video and audio calls
- NAT traversal via Google STUN servers
- Automatic fallback to audio-only mode if the webcam is unavailable
- Interface with full-screen remote video and local Picture-in-Picture video
- Incoming call modal with accept/reject buttons
- Call state management: ringing, active, ended

### Authentication System
- Session-based authentication with secure cookies (HttpOnly, Secure, SameSite)
- Password hashing with bcrypt (10 rounds)
- Role-based access control (ADMIN / USER)
- Protected routes on both server (middleware) and client side (React Router)

### Admin Panel
- Active users displayed via MUI DataGrid table
- Direct creation of new users (with auto-generated temporary password)
- Pending registration request management (approve/reject)
- Automatic email notifications for registration, approval, rejection, and credentials

### User Profile Management
- Edit username, phone number, and address
- Avatar upload (max 5MB, JPEG/PNG/GIF formats)
- Password change (requires current password)

### User Presence
- Real-time presence status: Online, Offline, Away
- Color-coded indicators in the contacts list (green/orange/red)
- Automatic updates on WebSocket connection and disconnection

### Internationalization
- Full Italian / English bilingual support
- Language toggle in the header (IT / EN)
- Preference saved in browser localStorage

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 25.2+ | JavaScript runtime |
| Express | 5.2 | HTTP framework |
| TypeScript | 5.9 | Typed language |
| Prisma | 6.19 | Database ORM |
| MySQL | - | Relational database |
| WebSocket (ws) | 8.18 | Real-time messaging |
| Zod | 4.1 | Input validation |
| bcrypt | 6.0 | Password hashing |
| Nodemailer | 7.0 | SMTP email sending |
| Multer | 2.0 | File uploads |
| Node.js crypto | (built-in) | AES-256-GCM encryption |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI library |
| TypeScript | ~5.9 | Typed language |
| Vite | 7.2 | Build tool & dev server |
| MUI (Material UI) | 7.3 | UI components |
| MUI X DataGrid | 8.22 | Data tables for admin panel |
| React Router | 7.10 | Client-side routing |
| i18next | 25.7 | Internationalization |
| Zod | 4.2 | Schema validation |
| emoji-picker-react | 4.16 | Emoji selector |

## Architecture

### Project Structure

```
Heya/
├── backend/
│   ├── prisma/                    # Database schema & migrations
│   │   └── schema.prisma
│   ├── src/
│   │   ├── index.ts               # HTTPS server entry point
│   │   ├── controllers/           # Business logic
│   │   │   ├── user.controller.ts
│   │   │   ├── conversation.controller.ts
│   │   │   ├── conversation.partecipant.controller.ts
│   │   │   └── admin/
│   │   │       └── management.controller.ts
│   │   ├── models/                # Database queries (Prisma)
│   │   │   ├── user.model.ts
│   │   │   ├── admin.model.ts
│   │   │   ├── conversation.model.ts
│   │   │   ├── converstation.partecipant.model.ts
│   │   │   └── message.model.ts
│   │   ├── routes/                # API endpoint definitions
│   │   │   ├── index.ts
│   │   │   ├── user.route.ts
│   │   │   ├── conversation.route.ts
│   │   │   ├── conversation.partecipant.route.ts
│   │   │   └── admin/
│   │   │       └── management.routes.ts
│   │   ├── middleware/            # Authentication & uploads
│   │   │   ├── auth.ts
│   │   │   └── upload.ts
│   │   ├── services/              # Services (email, calls)
│   │   │   ├── call.service.ts
│   │   │   └── mail/
│   │   │       ├── mail.services.ts
│   │   │       └── transporter.ts
│   │   ├── types/                 # Zod schemas & TypeScript types
│   │   ├── utils/                 # Encryption & utilities
│   │   └── webSocket/            # WebSocket & WebRTC handlers
│   │       ├── webSocket.handler.ts
│   │       └── webrtc.handler.ts
│   ├── ssl/                       # Self-signed SSL certificates
│   └── uploads/avatars/           # User avatars
│
├── frontend/
│   ├── public/                    # Static assets (logo, font)
│   └── src/
│       ├── main.tsx               # React entry point
│       ├── App.tsx                # Root component with routing
│       ├── api/                   # API clients (fetch + Zod)
│       ├── components/            # Reusable components
│       │   ├── header.tsx         # Navbar with language toggle
│       │   ├── callModal.tsx      # Video call UI
│       │   ├── createModal.tsx    # Create user modal
│       │   ├── deleteModal.tsx    # Delete user modal
│       │   └── approveUserModal.tsx # Approve user modal
│       ├── context/               # React Context (Auth, WebSocket)
│       ├── hooks/                 # Custom hooks (useAuth, useWebRTC)
│       ├── lang/                  # Translation files (it.json, en.json)
│       ├── pages/                 # Application pages
│       │   ├── login.page.tsx
│       │   ├── registrationUser.page.tsx
│       │   ├── chat.page.tsx
│       │   ├── profile.page.tsx
│       │   ├── adminUser.page.tsx
│       │   └── notFound.tsx
│       ├── provider/              # Global state providers
│       ├── routes/                # Route guards
│       └── types/                 # Zod schemas & shared types
```

### Database Schema

The MySQL database consists of 5 main tables:

- **User** — User accounts with role (ADMIN/USER), presence status, and avatar
- **UserRegistrationRequest** — Registration requests pending approval
- **Conversation** — Conversation container
- **ConversationParticipant** — User-conversation association table
- **Message** — Encrypted messages (AES-256-GCM ciphertext, IV, authentication tag)

### API Endpoints

All APIs are exposed under the `/heya` prefix:

| Group | Base Path | Authentication |
|---|---|---|
| User | `/heya/user` | Mixed (login/register are public) |
| Administration | `/heya/management` | Admin only |
| Conversations | `/heya/conversations` | Authenticated users |
| Contacts | `/heya/contacts` | Authenticated users |

### Frontend Application Routes

| Path | Page | Access |
|---|---|---|
| `/` | Login | Public |
| `/register` | Registration | Public |
| `/HeyaChat` | Chat | Authenticated users |
| `/HeyaProfile` | Profile | Authenticated users |
| `/HeyaManagementUser` | Active user management | Admin only |
| `/HeyaManagementRequest` | Request management | Admin only |

## Installation and Setup

### Prerequisites
- Node.js v25.2 or higher
- MySQL
- SSL certificates (self-signed for development, included in `backend/ssl/`)

### 1. Clone the repository
```bash
git clone https://github.com/ItsDamiArt/Heya.git
cd Heya
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder with the following variables:
```env
DATABASE_URL="mysql://user:password@localhost:3306/heya"
SESSION_SECRET="your_session_secret_key"
ENCRYPTION_KEY="32_byte_hex_key"

MAIL_HOST="smtp.example.com"
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER="your_email"
MAIL_PASS="your_email_password"
MAIL_ADMIN="admin@example.com"
```

Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

Start the backend server:
```bash
npm run dev
```
The HTTPS server will be available at `https://localhost:3000`.

### 3. Set up the Frontend
```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```
The application will be available at `https://localhost:5173`.

## Design and UI

The application uses a warm and elegant color palette:

| Color | Hex Value | Usage |
|---|---|---|
| Brown | `#221613` | Primary text, dark backgrounds |
| Camel | `#72473d` | Accents, primary buttons |
| White | `#ece9e1` | Light backgrounds |
| Beige | `#b49d94` | Secondary elements |
| Dove | `#8d8284` | Secondary text |
| Ivory | `#dac4b9` | Card backgrounds |

- Custom font: **Satoshi Variable**
- Modern rounded design (borderRadius: 50px/30px)
- Responsive layout with 870px breakpoint (mobile/desktop)
- MUI components customized via `sx` props for visual consistency

## Authors

**AndreOne & Dami**

Developed by Federica Lecce - ItsDamiArt & Andrea Vandero - AndreOne — Heya! Chat
