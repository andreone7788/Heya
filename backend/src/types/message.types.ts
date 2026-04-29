//FEDERICA

import z from 'zod';

// ============= SCHEMI VALIDAZIONE (INPUT) =============

// Il client manda PLAINTEXT, il server cripta
export const CreateMessageInputSchema = z.object({
    receiverId: z.number().int().positive(),
    content: z.string().min(1).max(5000)
});

export const GetMessagesSchema = z.object({
    conversationId: z.number().int().positive(),
    limit: z.number().int().positive().max(100).default(50),
    offset: z.number().int().min(0).default(0),
    before: z.number().int().positive().optional(), // Per paginazione infinita
});

// Types inferiti (INPUT)
export type TypeCreateMessageInput = z.infer<typeof CreateMessageInputSchema>;
export type TypeGetMessages = z.infer<typeof GetMessagesSchema>;

// ============= SCHEMI OUTPUT =============

// Info sender (nested object)
export const MessageSenderSchema = z.object({
    userId: z.number(),
    name: z.string(),
    surname: z.string(),
    username: z.string(),
    avatarUrl: z.string().nullable(),
    presenceStatus: z.enum(['ONLINE', 'OFFLINE', 'AWAY']),
});

// Messaggio DECRIPTATO (per response al client)
export const DecryptedMessageSchema = z.object({
    id: z.number(),
    conversationId: z.number(),
    senderId: z.number(),
    content: z.string(), // PLAINTEXT decriptato
    createdAt: z.date(),
    isRead: z.boolean(),
    sender: MessageSenderSchema,
});

// Messaggio CRIPTATO (per storage interno, non esposto al client)
export const EncryptedMessageSchema = z.object({
    id: z.number(),
    conversationId: z.number(),
    senderId: z.number(),
    ciphertext: z.string(),
    iv: z.instanceof(Buffer),
    tag: z.instanceof(Buffer),
    keyId: z.string(),
    createdAt: z.date(),
    isRead: z.boolean(),
});

// Types inferiti (OUTPUT)
export type TypeMessageSender = z.infer<typeof MessageSenderSchema>;
export type TypeDecryptedMessage = z.infer<typeof DecryptedMessageSchema>;
export type TypeEncryptedMessage = z.infer<typeof EncryptedMessageSchema>;