//FEDERICA

import z from 'zod';

// ============= SCHEMI VALIDAZIONE (INPUT) =============

export const CreateConversationSchema = z.object({
    participantIds: z
        .array(z.number().int().positive())
        .length(2, { message: "Una conversazione 1-a-1 deve avere esattamente 2 partecipanti" }),
});

export const GetConversationSchema = z.object({
    conversationId: z.number().int().positive(),
});

export const GetUserConversationsSchema = z.object({
    limit: z.number().int().positive().max(50).default(30),
    offset: z.number().int().min(0).default(0),
});

export const MarkReadSchema = z.object({
    conversationId: z.number().int().positive()
});

// Types inferiti (INPUT)
export type TypeCreateConversation = z.infer<typeof CreateConversationSchema>;
export type TypeGetConversation = z.infer<typeof GetConversationSchema>;
export type TypeGetUserConversations = z.infer<typeof GetUserConversationsSchema>;
export type TypeMarkRead = z.infer<typeof MarkReadSchema>;

// ============= SCHEMI OUTPUT (con Zod) =============

// Partecipante
export const ParticipantSchema = z.object({
    userId: z.number(),
    name: z.string(),
    surname: z.string(),
    username: z.string(),
    avatarUrl: z.string().nullable(),
    presenceStatus: z.enum(['ONLINE', 'OFFLINE', 'AWAY']),
});

// Preview ultimo messaggio
export const MessagePreviewSchema = z.object({
    id: z.number(),
    senderId: z.number(),
    ciphertext: z.string(),
    iv: z.instanceof(Buffer),
    tag: z.instanceof(Buffer),
    createdAt: z.date(),
    isRead: z.boolean(),
});

// Conversazione completa
export const ConversationSchema = z.object({
    id: z.number(),
    createdAt: z.date(),
    participants: z.array(ParticipantSchema),
    lastMessage: MessagePreviewSchema.nullable(),
    unreadCount: z.number(),
});

// Types inferiti (OUTPUT)
export type TypeParticipant = z.infer<typeof ParticipantSchema>;
export type TypeMessagePreview = z.infer<typeof MessagePreviewSchema>;
export type TypeConversation = z.infer<typeof ConversationSchema>;