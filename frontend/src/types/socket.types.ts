import { z } from 'zod';

export const WebSocketMessageSchema = z.object({
  type: z.enum(['message', 'sent', 'error', 'presence']),
  from: z.number().optional(),
  to: z.number().optional(),
  conversationId: z.number().optional(),
  text: z.string().optional(),
  timestamp: z.string().optional(),
  userId: z.number().optional(),
  status: z.enum(['ONLINE', 'OFFLINE', 'AWAY']).optional(),
  message: z.string().optional(),
});

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

export const SendMessageSchema = z.object({
  type: z.literal('private'),
  to: z.number().int().positive(),
  text: z.string().min(1).max(5000),
});

export type SendMessage = z.infer<typeof SendMessageSchema>;

export const RegisterWebSocketSchema = z.object({
  type: z.literal('register'),
  userId: z.number().int().positive(),
  status: z.enum(['ONLINE', 'OFFLINE', 'AWAY']).optional(),
});

export type RegisterWebSocket = z.infer<typeof RegisterWebSocketSchema>;

export interface WebSocketContextType {
  ws: WebSocket | null;
  isConnected: boolean;
  messages: WebSocketMessage[];
  presenceMap: Map<number, 'ONLINE' | 'OFFLINE' | 'AWAY'>;
  sendMessage: (to: number, text: string) => void;
  registerUser: (userId: number, status?: 'ONLINE' | 'OFFLINE' | 'AWAY') => void; 
  disconnect: () => void;
}

// ================ NUOVI TIPI WEBRTC ==================

// Schema per SDP (Session Description Protocol)
const RTCSessionDescriptionSchema = z.object({
  type: z.enum(['offer', 'answer']),
  sdp: z.string(),
});

// Schema per ICE Candidate
const RTCIceCandidateSchema = z.object({
  candidate: z.string(),
  sdpMid: z.string().nullable(),
  sdpMLineIndex: z.number().optional(),
});

// Messaggio: offerta di chiamata (A -> B)
export const WebRTCOfferMessageSchema = z.object({
  type: z.literal('call-offer'),
  from: z.number(),
  sdp: RTCSessionDescriptionSchema,
  conversationId: z.number(),
});

// Messaggio: risposta alla chiamata (B -> A)
export const WebRTCAnswerMessageSchema = z.object({
  type: z.literal('call-answer'),
  from: z.number(),
  sdp: RTCSessionDescriptionSchema,
});

// Messaggio: ICE Candidate
export const WebRTCIceCandidateMessageSchema = z.object({
  type: z.literal('ice-candidate'),
  from: z.number(),
  candidate: RTCIceCandidateSchema,
});

// Messaggio: Chiamata rifiutata
export const WebRTCCallRejectedMessageSchema = z.object({
  type: z.literal('call-reject'),
  from: z.number(),
});

// Messaggio: Chiamata terminata
export const WebRTCCallEndedMessageSchema = z.object({
  type: z.literal('end-call'),
  from: z.number(),
});

// Messaggio: Errore chiamata
export const WebRTCCallErrorMessageSchema = z.object({
  type: z.literal('call-error'),
  message: z.string(),
});

// Unione di tutti i messaggi WebRTC
export const WebRTCMessageSchema = z.union([
  WebRTCOfferMessageSchema,
  WebRTCAnswerMessageSchema,
  WebRTCIceCandidateMessageSchema,
  WebRTCCallRejectedMessageSchema,
  WebRTCCallEndedMessageSchema,
  WebRTCCallErrorMessageSchema,
]);

export type WebRTCMessage = z.infer<typeof WebRTCMessageSchema>;
export type RTCSessionDescription = z.infer<typeof RTCSessionDescriptionSchema>;
export type RTCIceCandidate = z.infer<typeof RTCIceCandidateSchema>;
export type WebRTCOfferMessage = z.infer<typeof WebRTCOfferMessageSchema>;
export type WebRTCAnswerMessage = z.infer<typeof WebRTCAnswerMessageSchema>;
export type WebRTCIceCandidateMessage = z.infer<typeof WebRTCIceCandidateMessageSchema>;
export type WebRTCCallRejectedMessage = z.infer<typeof WebRTCCallRejectedMessageSchema>;
export type WebRTCCallEndedMessage = z.infer<typeof WebRTCCallEndedMessageSchema>;

// Tipo per lo stato incomingCall nell'hook
export interface IncomingCallState {
  from: number;
  conversationId: number;
  sdp: RTCSessionDescriptionInit;
}