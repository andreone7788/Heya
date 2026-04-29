import { useState, useEffect, useRef, useCallback } from 'react'
import { useWebSocket } from '../context/wsContext'
import { useAuth } from '../hooks/useAuth'
import { useWebRTC } from '../hooks/useWebRTC'
import { CallModal } from '../components/callModal'
import { getAllContactsApi } from '../api/conversation.partecipant.api'
import { getOrCreateConversationApi, getConversationMessagesApi, getUnreadCountsApi, markConversationAsReadApi } from '../api/conversation.api'
import type { Contact } from '../types/conversation.partecipant.types'
import type { Message } from '../types/message.types'
import { useTranslation } from 'react-i18next'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import { ArrowBackRounded, Send, SentimentSatisfiedAltOutlined } from '@mui/icons-material'
import EmojiPicker from 'emoji-picker-react'
import Box from '@mui/material/Box'
import { Button, IconButton, InputAdornment, TextField, useMediaQuery } from '@mui/material'
import React from 'react'

export const ChatPage = () => {
    const [input, setInput] = useState('')
    const [recipient, setRecipient] = useState<Contact | null>(null)
    const [loadedMessages, setLoadedMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [contacts, setContacts] = useState<Contact[]>([])
    const [myStatus, setMyStatus] = useState<'online' | 'offline' | 'away'>('online')
    const { messages, sendMessage, registerUser, isConnected, presenceMap } = useWebSocket()
    const { user } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const [unread, setUnread] = useState<Map<number, number>>(new Map())
    const processedMessagesRef = useRef<Set<string>>(new Set())
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showContacts, setShowContacts] = useState(true);
    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // ✅ 5 minuti
    const { t } = useTranslation()

    const apiUrl = import.meta.env.VITE_API_URL.replace('/heya', '')

    const { isInCall, incomingCall, startCall, acceptCall, rejectCall, endCall } = useWebRTC({
        recipientId: recipient?.userId || null,
        localVideoRef,
        remoteVideoRef
    })

    const isMobile = useMediaQuery('(max-width:870px)');

    // Carica i contatti
    useEffect(() => {
        const loadContacts = async () => {
            try {
                const contactsList = await getAllContactsApi()
                setContacts(contactsList)
            } catch (error) {
                console.error('Errore caricamento contatti:', error)
            }
        }
        loadContacts()
    }, [])

    // Carica badge non letti dal DB all'avvio
    useEffect(() => {
        const loadUnreadCounts = async () => {
            try {
                if (!user?.userId) return;

                const data = await getUnreadCountsApi();
                const map = new Map(Object.entries(data).map(([k, v]) => [Number(k), Number(v)]));
                setUnread(map);
            } catch (error) {
                console.error('Errore caricamento badge:', error);
            }
        };

        if (user?.userId) {
            loadUnreadCounts();
        }
    }, [user?.userId]);

    // ✅ Registra utente con status quando si connette
    useEffect(() => {
        if (user?.userId && isConnected) {
            registerUser(user.userId, myStatus.toUpperCase() as 'ONLINE' | 'OFFLINE' | 'AWAY')
        }
    }, [user?.userId, isConnected, registerUser, myStatus])

    // ✅ Funzione per aggiornare lo status
    const updateStatus = useCallback((newStatus: 'online' | 'offline' | 'away') => {
        if (myStatus === newStatus) return

        setMyStatus(newStatus)

        if (user?.userId && isConnected) {
            registerUser(user.userId, newStatus.toUpperCase() as 'ONLINE' | 'OFFLINE' | 'AWAY')
        }
    }, [myStatus, user?.userId, isConnected, registerUser])

    // ✅ Reset del timer di inattività
    const resetInactivityTimer = useCallback(() => {
        // Solo se lo status corrente è AWAY, torna a ONLINE
        if (myStatus === 'away') {
            updateStatus('online')
        }

        // Cancella il timer esistente
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current)
        }

        // Avvia un nuovo timer
        inactivityTimerRef.current = setTimeout(() => {
            updateStatus('away')
        }, INACTIVITY_TIMEOUT)
    }, [myStatus, updateStatus, INACTIVITY_TIMEOUT])

    // ✅ Rileva attività utente e gestisce il timer di inattività
    useEffect(() => {
        if (!user?.userId || !isConnected) return

        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']

        events.forEach(event => {
            window.addEventListener(event, resetInactivityTimer)
        })

        // Avvia il timer iniziale
        resetInactivityTimer()

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetInactivityTimer)
            })

            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current)
            }
        }
    }, [user?.userId, isConnected, resetInactivityTimer])

    // Carica i messaggi quando viene selezionato un contatto
    useEffect(() => {
        if (!recipient || !user?.email) return

        const loadMessages = async () => {
            setLoading(true)
            try {
                const conv = await getOrCreateConversationApi(user.email, recipient.email)
                const msgs = await getConversationMessagesApi(conv.id, 50)
                setLoadedMessages(msgs)


            } catch (error) {
                console.error('Errore caricamento messaggi:', error)
            } finally {
                setLoading(false)
            }
        }
        loadMessages()
    }, [recipient, user?.email])

    // Scroll automatico ai nuovi messaggi
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loadedMessages])

    // Recupera lo status di un contatto
    const getContactStatus = (userId: number): 'online' | 'offline' | 'away' => {
        if (presenceMap.has(userId)) {
            const status = presenceMap.get(userId)!
            return status.toLowerCase() as 'online' | 'offline' | 'away'
        }
        const contact = contacts.find(c => c.userId === userId)
        const presence = contact?.presence?.toLowerCase() as 'online' | 'offline' | 'away'
        return presence || 'offline'
    }

    // Gestione badge per nuovi messaggi WebSocket
    useEffect(() => {
        if (messages.length === 0 || !user?.userId) return

        const lastMessage = messages[messages.length - 1]
        const senderId = lastMessage.from

        if (!senderId || lastMessage.to !== user.userId) return

        const messageId = `${senderId}-${lastMessage.timestamp}`

        if (processedMessagesRef.current.has(messageId)) {
            return
        }

        processedMessagesRef.current.add(messageId)

        // Messaggio da chat DIVERSA → incrementa
        if (senderId !== recipient?.userId) {
            setUnread(prev => {
                const newMap = new Map(prev)
                const newCount = (newMap.get(senderId) || 0) + 1
                newMap.set(senderId, newCount)
                return newMap
            })
        }
    }, [messages, user?.userId, recipient?.userId])



    // Gestisce la selezione di un contatto
    const handleSelectContact = async (contact: Contact) => {
        setRecipient(contact)
        if (isMobile) {
            setShowContacts(false);
        }
        setLoadedMessages([])

        // Azzera immediatamente il badge nello stato locale
        setUnread(prev => {
            const newMap = new Map(prev)
            newMap.delete(contact.userId)
            return newMap
        })

        if (!user?.email) return

        setLoading(true)
        try {
            const conv = await getOrCreateConversationApi(user.email, contact.email)
            const msgs = await getConversationMessagesApi(conv.id, 50)
            setLoadedMessages(msgs)

            // Segna come letti nel DB
            await markConversationAsReadApi(conv.id)

        } catch (error) {
            console.error('Errore caricamento messaggi:', error)
        } finally {
            setLoading(false)
        }
    }

    // Torna alla lista contatti
    const handleBackToContacts = () => {
        setRecipient(null);
        if (isMobile) {
            setShowContacts(true);
        }
    };

    // ✅ Invia un messaggio e resetta il timer di inattività
    const handleSend = () => {
        const text = input.trim();

        if (!text || !recipient || !user?.userId) {
            return;
        }

        sendMessage(recipient.userId, text);

        // Azzera il badge quando invii un messaggio
        if (recipient) {
            setUnread(prev => {
                const newMap = new Map(prev);
                newMap.delete(recipient.userId);
                return newMap;
            });
        }

        // ✅ Reset timer di inattività quando invii un messaggio
        resetInactivityTimer()

        setInput('');
    };

    const allMessages = [
        ...loadedMessages.map(msg => ({
            type: 'message' as const,
            from: msg.senderId,
            to: recipient?.userId ?? 0,
            text: msg.content,
            timestamp: typeof msg.createdAt === 'string' ? msg.createdAt : (msg.createdAt as Date).toISOString()
        })),
        ...messages
            .filter(msg => {
                if (!recipient) return false;

                const isCurrentChat =
                    (msg.from === user?.userId && msg.to === recipient.userId) ||
                    (msg.from === recipient.userId && msg.to === user?.userId);

                if (!isCurrentChat) return false;

                if (!msg.timestamp) return false;

                const isAlreadyInDB = loadedMessages.some(dbMsg => {
                    const dbTimestamp = typeof dbMsg.createdAt === 'string'
                        ? dbMsg.createdAt
                        : (dbMsg.createdAt as Date).toISOString();

                    return dbMsg.senderId === msg.from &&
                        dbMsg.content === msg.text &&
                        Math.abs(
                            new Date(dbTimestamp).getTime() -
                            new Date(msg.timestamp!).getTime()
                        ) < 2000;
                });

                return !isAlreadyInDB;
            })
            .map(msg => ({
                type: 'message' as const,
                from: msg.from,
                to: msg.to,
                text: msg.text,
                timestamp: msg.timestamp || new Date().toISOString()
            }))
    ];

    const uniqueMessages = allMessages
        .filter((msg, index, self) =>
            index === self.findIndex((m) =>
                m.text === msg.text &&
                Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 1000
            )
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return (
        <Box className="chat-container"
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: '6em 1em 1em',
                fontFamily: 'SATOSHI-VARIABLE',
                height: '100vh',
                overflow: 'hidden',
                boxSizing: 'border-box',
                '@media (max-width: 870px)': {
                    flexDirection: 'column',
                    padding: '9em 0.7em 1em',

                },

            }}>

            <Box sx={{
                display: 'flex',
                maxWidth: '400px',
                width: '100%',
                flexDirection: 'column',
                paddingRight: '0.5em',
                borderRight: '1px solid var(--beige)',
                '@media (max-width: 870px)': {
                    maxWidth: '100vw',
                    width: '100%'
                }
            }}>
                <Box className="contacts-header">

                    {user && (
                        <Box className="my-profile"
                            sx={{
                                display: 'flex',
                                gap: '1em',
                                alignItems: 'center',
                                backgroundColor: 'var(--beige)',
                                padding: '0.5em',
                                borderRadius: '50px',
                                color: "var(--brown)",
                                '@media (max-width: 870px)': {
                                    display: recipient ? 'none' : 'flex',
                                },
                            }}
                        >
                            <div className="my-avatar-wrapper"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}>
                                {user.avatarUrl ? (
                                    <img
                                        src={`${apiUrl}${user.avatarUrl}`}
                                        alt={user.name}
                                        className="my-avatar-img"
                                        style={{ width: '4em', height: '4em', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="my-avatar"
                                        style={{
                                            width: '2em',
                                            height: '2em',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2em',
                                            backgroundColor: 'var(--camel)',
                                            color: 'var(--white)'
                                        }}>
                                        {user.name?.[0]}{user.surname?.[0]}
                                    </div>
                                )}
                                <div className={`my-status ${myStatus}`} />
                            </div>
                            <div className="my-info">
                                <div className="my-name">
                                    {user.name} {user.surname}
                                </div>
                                <div className="my-status-text"
                                    style={{
                                        color: myStatus === 'online'
                                            ? '#00760e'
                                            : myStatus === 'away'
                                                ? '#ff9500'
                                                : '#c80909'
                                    }}>
                                    {myStatus === 'online' ? 'Online' : myStatus === 'away' ? 'Assente' : 'Offline'}
                                </div>
                            </div>
                        </Box>
                    )}
                </Box>

                {(showContacts || !isMobile) && (
                    <>
                        <h2 style={{ textAlign: 'center', marginTop: '1em' }}>{t('chat.chat')}</h2>

                        <Box
                            className="contacts-sidebar"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                overflowY: 'auto',
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'var(--white) var(--ivory)',
                                width: '100%',
                                '@media (max-width: 870px)': {
                                    width: '100vw',
                                    maxWidth: '100%',
                                    maxHeight: 'calc(100vh - 160px )',
                                    boxSizing: 'border-box'
                                },
                            }}
                        >

                            <div className="contacts-list"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '0.5em',
                                    color: "var(--brown)",
                                    maxHeight: '100vh',
                                    height: '100%',
                                    boxSizing: 'border-box'
                                }}>

                                {contacts.length === 0 ? (
                                    <div className="empty-contacts">
                                        {t('chat.notAvailable')}
                                    </div>
                                ) : (
                                    contacts.map(contact => {
                                        const contactStatus = getContactStatus(contact.userId)
                                        const isSelected = recipient?.userId === contact.userId
                                        const unreadCount = unread.get(contact.userId) || 0

                                        return (

                                            <Box
                                                key={contact.userId}
                                                sx={{
                                                    '& :hover': {
                                                        backgroundColor: 'var(--beige)'
                                                    }
                                                }}
                                            >
                                                <Box
                                                    key={contact.userId}
                                                    className={`contact-item ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleSelectContact(contact)}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '0.5em',
                                                    }}>

                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5em',
                                                        padding: '1em 1em'
                                                    }}>


                                                        <div className="contact-avatar-wrapper">
                                                            {contact.avatar ? (
                                                                <img
                                                                    src={`${apiUrl}${contact.avatar}`}
                                                                    alt={`${contact.name} ${contact.surname}`}
                                                                    className="contact-avatar-img"
                                                                    style={{ width: '4em', height: '4em', borderRadius: '50%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <div className="contact-avatar"
                                                                    style={{
                                                                        width: '2em',
                                                                        height: '2em',
                                                                        borderRadius: '50%',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '2em',
                                                                        backgroundColor: 'var(--camel)',
                                                                        color: 'var(--white)'
                                                                    }}>
                                                                    {contact.name[0]}{contact.surname[0]}
                                                                </div>
                                                            )}
                                                            <div className={`contact-status ${contactStatus}`} />
                                                        </div>
                                                        <div className="contact-info">
                                                            <div className="contact-name">
                                                                {contact.name} {contact.surname}
                                                            </div>
                                                            <div className="contact-username">
                                                                @{contact.username}
                                                            </div>
                                                        </div>

                                                    </div>

                                                    {unreadCount > 0 && (
                                                        <div className="unread-badge"
                                                            style={{
                                                                marginRight: '1em',
                                                                padding: '0.25em 0.75em',
                                                                backgroundColor: 'var(--camel)',
                                                                color: 'var(--white)',
                                                                borderRadius: '50px'
                                                            }}>
                                                            {unreadCount > 99 ? '99+' : unreadCount}
                                                        </div>
                                                    )}

                                                </Box>


                                                <hr style={{
                                                    backgroundColor: 'var(--beige)',
                                                    border: 'none',
                                                    height: '1px'
                                                }}
                                                />
                                            </Box>
                                        )
                                    })
                                )}
                            </div>
                        </Box>
                    </>

                )}

            </Box>




            {(!showContacts || !isMobile) && (

                <Box id="chat"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: '100vw',
                        width: '100%',
                        padding: '0 0.5em',
                        boxSizing: 'border-box',
                        flexGrow: 1,
                        maxHeight: '100vh',
                        height: '100%',
                        '@media (max-width: 870px)': {
                            width: '100vw',
                            maxWidth: '100%',
                            maxHeight: 'calc(100vh - 160px )',
                            height: '100%',
                            padding: 0
                        },
                    }}>
                    {recipient && (
                        <div className="chat-header"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--beige)',
                                borderRadius: '50px',
                                color: "var(--brown)",
                                boxSizing: 'border-box'
                            }}>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5em'
                            }}>

                                <Button onClick={handleBackToContacts} sx={{
                                    backgroundColor: 'transparent',
                                    display: 'flex',
                                    border: 'none',
                                    minWidth: '0px',
                                    '& :hover': {
                                        backgroundColor: 'var(--brown)',
                                        color: "var(--white)",
                                    }
                                }}>
                                    <ArrowBackRounded sx={{
                                        color: 'var(--brown)',
                                        display: 'flex',
                                        border: 'none',
                                        padding: '0.3em',
                                        borderRadius: '30px',
                                    }} />
                                </Button>
                                {recipient.avatar ? (
                                    <img
                                        src={`${apiUrl}${recipient.avatar}`}
                                        alt={`${recipient.name} ${recipient.surname}`}
                                        className="recipient-avatar-img"
                                        style={{ width: '4em', height: '4em', borderRadius: '50%', objectFit: 'cover', margin: '0.5em 0' }}
                                    />
                                ) : (
                                    <div className="recipient-avatar"
                                        style={{
                                            width: '2em',
                                            height: '2em',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2em',
                                            backgroundColor: 'var(--camel)',
                                            color: 'var(--white)',
                                            margin: '0.25em 0'
                                        }}>
                                        {recipient.name[0]}{recipient.surname[0]}
                                    </div>
                                )}
                                <div className="recipient-info"
                                    style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="recipient-name">
                                        {recipient.name} {recipient.surname}
                                    </div>
                                    <div className="recipient-status" style={{
                                        color: getContactStatus(recipient.userId) === 'online'
                                            ? '#00760e'
                                            : getContactStatus(recipient.userId) === 'away'
                                                ? '#ff9500'
                                                : '#c80909'
                                    }}>
                                        <span className={`status-indicator ${getContactStatus(recipient.userId)}`} />
                                        <span>
                                            {getContactStatus(recipient.userId) === 'online'
                                                ? 'Online'
                                                : getContactStatus(recipient.userId) === 'away'
                                                    ? 'Assente'
                                                    : 'Offline'}
                                        </span>
                                    </div>



                                </div>

                            </div>

                            <Button
                                onClick={async () => {
                                    if (!recipient || !user?.email) return;
                                    const conv = await getOrCreateConversationApi(user.email, recipient.email);
                                    startCall(conv.id);
                                }}
                                disabled={!recipient || getContactStatus(recipient.userId) === 'offline'}
                                className="call-button"
                                sx={{
                                    backgroundColor: 'transparent',
                                    display: 'flex',
                                    border: 'none',
                                    minWidth: '0px',
                                    '& :hover': {
                                        backgroundColor: 'var(--brown)',
                                        color: "var(--white)",
                                    }
                                }}
                            >
                                <VideocamRoundedIcon sx={{
                                    display: 'flex',
                                    border: 'none',
                                    padding: '0.34em',
                                    borderRadius: '30px',
                                    color: recipient && getContactStatus(recipient.userId) === 'offline'
                                        ? 'var(--dove)'
                                        : 'var(--brown)',
                                    '&.Mui-disabled': {
                                        color: 'var(--dove)',
                                    },
                                    '&:hover': {
                                        color: recipient && getContactStatus(recipient.userId) !== 'offline'
                                            ? 'var(--white)'
                                            : 'var(--dove)',
                                    },
                                }} />
                            </Button>
                        </div>
                    )}

                    <Box className="chat-area"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                            padding: '0 0.5em',
                            boxSizing: 'border-box',
                            scrollbarColor: 'var(--white) var(--ivory)',
                            maxHeight: '100vh',
                            height: '100%',
                            marginTop: '1em',
                            justifyContent: 'space-between',
                            '@media (max-width: 870px)': {
                                width: '100%',
                                maxWidth: '100%',
                                padding: 0
                            },
                        }}>

                        {!recipient ? (
                            <Box className="chat-placeholder" sx={{
                                backgroundImage: 'url("/heya_logo.svg")',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '350px',
                                maxHeight: '100vh',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '2em'

                            }}>
                                <h2>{t('chat.title')}</h2>
                                <p>{t('chat.subtitle')}</p>
                            </Box>
                        ) : (
                            <>
                                <Box className="messages-area"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5em',
                                        overflowY: 'auto',
                                        scrollbarWidth: 'thin',
                                        '@media (max-width: 870px)': {
                                            overflowY: 'auto',
                                            paddingRight: '0.5em',
                                            scrollbarWidth: 'thin',
                                        },
                                    }}>
                                    {loading ? (
                                        <div className="loading-messages"
                                            style={{ display: 'flex', justifyContent: 'center', paddingTop: '20em', textAlign: 'center', color: 'var(--camel)' }}>
                                            {t('chat.loading')}
                                        </div>
                                    ) : uniqueMessages.length === 0 ? (
                                        <div className="empty-messages" style={{ display: 'flex', justifyContent: 'center', paddingTop: '20em', textAlign: 'center', color: 'var(--camel)' }}>
                                            <p>{t('chat.begin')}</p>
                                        </div>
                                    ) : (
                                        <>
                                            {uniqueMessages.map((msg, index) => {
                                                const fullTimestamp = new Date(msg.timestamp!).toISOString();
                                                const key = `${fullTimestamp}-${msg.text}-${index}`;
                                                const isMyMessage = msg.from === user?.userId;

                                                // ✅ LOGICA DATA: Mostra separatore se il giorno è diverso dal messaggio precedente
                                                const currentDate = new Date(msg.timestamp!);
                                                const previousMsg = index > 0 ? uniqueMessages[index - 1] : null;
                                                const previousDate = previousMsg ? new Date(previousMsg.timestamp!) : null;

                                                const shouldShowDateSeparator = !previousDate ||
                                                    currentDate.toDateString() !== previousDate.toDateString();

                                                return (
                                                    <React.Fragment key={key}>
                                                        {shouldShowDateSeparator && (
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    margin: '1.5em 0 1em',
                                                                    gap: '0.5em'
                                                                }}
                                                            >
                                                                <hr style={{
                                                                    flex: 1,
                                                                    border: 'none',
                                                                    height: '1px',
                                                                    backgroundColor: 'var(--camel)',
                                                                    opacity: 0.3
                                                                }} />
                                                                <span style={{
                                                                    fontSize: '0.85em',
                                                                    color: 'var(--camel)',
                                                                    fontWeight: 500,
                                                                    whiteSpace: 'nowrap'
                                                                }}>
                                                                    {currentDate.toLocaleDateString('it-IT', {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric'
                                                                    })}
                                                                </span>
                                                                <hr style={{
                                                                    flex: 1,
                                                                    border: 'none',
                                                                    height: '1px',
                                                                    backgroundColor: 'var(--camel)',
                                                                    opacity: 0.3
                                                                }} />
                                                            </Box>
                                                        )}

                                                        <Box
                                                            className={`message ${isMyMessage ? 'my-message' : 'their-message'}`}
                                                            sx={{
                                                                alignItems: isMyMessage ? 'flex-end' : 'flex-start',
                                                                boxSizing: 'border-box',
                                                                marginLeft: isMyMessage ? 'auto' : '0',
                                                                marginRight: isMyMessage ? '0' : 'auto',
                                                                maxWidth: '80%',
                                                                minWidth: '30%',
                                                                '@media (max-width: 870px)': {
                                                                    maxWidth: '100%',
                                                                },
                                                            }}
                                                        >
                                                            <Box className="message-bubble"
                                                                style={{
                                                                    backgroundColor: isMyMessage ? 'var(--camel)' : 'var(--beige)',
                                                                    padding: '0.5em 1em',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'flex-start',
                                                                    textAlign: 'left',
                                                                    gap: '0.2em',
                                                                    borderTopLeftRadius: '30px',
                                                                    borderTopRightRadius: '30px',
                                                                    borderBottomLeftRadius: isMyMessage ? '30px' : 0,
                                                                    borderBottomRightRadius: isMyMessage ? 0 : '30px',
                                                                    color: isMyMessage ? 'var(--white)' : 'var(--brown)',
                                                                    wordWrap: 'break-word',
                                                                    overflow: 'visible',
                                                                    whiteSpace: 'pre-wrap',
                                                                    fontSize: '1em',
                                                                    boxSizing: 'border-box',
                                                                }}
                                                            >
                                                                <p>{msg.text}</p>
                                                                <small style={{
                                                                    color: isMyMessage ? 'var(--beige)' : 'var(--camel)',
                                                                    fontSize: '0.75em',
                                                                    textAlign: 'right',
                                                                    marginLeft: 'auto',
                                                                    display: 'block',
                                                                }}>
                                                                    {currentDate.toLocaleTimeString('it-IT', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </small>
                                                            </Box>
                                                        </Box>
                                                    </React.Fragment>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </Box>

                                <div className="message-input-area"
                                    style={{
                                        maxWidth: '100vw',
                                        width: '100%',
                                    }}
                                >
                                    <TextField
                                        ref={inputRef}
                                        id="message-input"
                                        name="message"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder={t('chat.write')}
                                        autoComplete="off"
                                        disabled={loading}
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <IconButton
                                                            onClick={() => setShowEmojiPicker(v => !v)}
                                                            sx={{
                                                                color: 'var(--brown)'
                                                            }}
                                                        >
                                                            <SentimentSatisfiedAltOutlined />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={handleSend}
                                                            disabled={!input.trim() || loading}
                                                            sx={{
                                                                color: !input.trim() || loading ? 'var(--dove)' : 'var(--brown)',
                                                            }}
                                                        >
                                                            <Send />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '30px',
                                                '& fieldset': {
                                                    borderColor: 'var(--camel)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'var(--brown)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'var(--brown)',
                                                },
                                            },
                                            '& input': {
                                                color: 'var(--brown)',
                                                fontFamily: 'SATOSHI-VARIABLE',
                                            },
                                            '&::placeholder': {
                                                color: 'var(--camel)',
                                            },
                                        }}
                                    />
                                    {showEmojiPicker && (
                                        <div style={{ position: 'absolute', bottom: '40px', left: 0, zIndex: 10 }}>
                                            <EmojiPicker

                                                onEmojiClick={(emojiData) => {
                                                    setInput(input + emojiData.emoji);
                                                    setShowEmojiPicker(false);

                                                }}

                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                    </Box>
                </Box>
            )}

            <CallModal
                isOpen={isInCall || incomingCall !== null}
                isIncoming={incomingCall !== null && !isInCall}
                callerName={
                    incomingCall
                        ? contacts.find(c => c.userId === incomingCall.from)?.name
                        : recipient?.name
                }
                onAccept={acceptCall}
                onReject={rejectCall}
                onEnd={endCall}
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
            />
        </Box>
    )
}