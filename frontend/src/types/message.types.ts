import { z } from 'zod';

// Schema per messaggio in arrivo dal WebSocket
export const WebSocketMessageSchema = z.object({
  type: z.enum(['message', 'sent', 'error', 'presence']),
  from: z.number().optional(),
  conversationId: z.number().optional(),
  text: z.string().optional(),
  timestamp: z.string().optional(),
  userId: z.number().optional(),
  status: z.enum(['ONLINE', 'OFFLINE', 'AWAY']).optional(),
  message: z.string().optional(),
});

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

// Schema per inviare messaggio
export const SendMessageSchema = z.object({
  type: z.literal('private'),
  to: z.number().int().positive(),
  text: z.string().min(1).max(5000),
});

export type SendMessage = z.infer<typeof SendMessageSchema>;

// Schema per registrazione WebSocket
export const RegisterWebSocketSchema = z.object({
  type: z.literal('register'),
  userId: z.number().int().positive(),
});

export type RegisterWebSocket = z.infer<typeof RegisterWebSocketSchema>;

// Schema per messaggio decriptato (da REST API)
export const MessageSchema = z.object({
  id: z.number(),
  senderId: z.number(),
  sender: z.object({
    userId: z.number(),
    name: z.string(),
    surname: z.string(),
    username: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  content: z.string(),
  createdAt: z.string().or(z.date()),
  isRead: z.boolean(),
});

export type Message = z.infer<typeof MessageSchema>;