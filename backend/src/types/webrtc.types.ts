import { z } from 'zod';

// Schema per la sessione di chiamate WebRTC 
// (traccia chi sta chiamando chi e lo stato della chiamata in memoria, non nel DB)
// Evita che riceva chiamate multiple contemporaneamente
// Tiene traccia dello stato della chiamata (RINGING, ACTIVE, ENDED)
export const CallSessionSchema = z.object({
    callerId: z.number(),
    receiverId: z.number(),
    conversationId: z.number(),
    startTime: z.date(),
    status: z.enum(['RINGING', 'ACTIVE', 'ENDED']),
});

// Schema per SDP (Session Description Protocol)
// Quando user A chiama user B, A invia un'offerta SDP a B
// Contiene l'SDP, ovvero informazioni su audio, video, codec, reti, ecc.
// Il backend inoltra questa offerta a B tramite WebSocket
const RTCSessionDescriptionSchema = z.object({
    type: z.enum(['offer', 'answer', 'pranswer', 'rollback']),
    sdp: z.string(),
});

// Schema per ICE candidate (Interactive Connectivity Establishment)
// Contiene indirizzi IP pubblici/privati per stabilire la connessione peer-to-peer
// Durante la chiamata, entrambi inviano più ICE candidates
// Il backend li inoltra avanti e indietro tra i due peer
const RTCIceCandidateSchema = z.object({
    candidate: z.string(),
    sdpMLineIndex: z.number().nullable(),
    sdpMid: z.string().nullable(),
    usernameFragment: z.string().nullable().optional(),
});

// Offerta di chiamata (quando A chiama B)
export const WebRTCOfferSchema = z.object({
    type: z.literal('call-offer'),
    to: z.number(),
    sdp: RTCSessionDescriptionSchema,
    conversationId: z.number(),
});

// Risposta alla chiamata (quando B accetta)
export const WebRTCAnswerSchema = z.object({
    type: z.literal('call-answer'),
    to: z.number(),
    sdp: RTCSessionDescriptionSchema,
});

// ICE candidate (per attraversare NAT/firewall)
export const WebRTCIceCandidateSchema = z.object({
    type: z.literal('ice-candidate'),
    to: z.number(),
    candidate: RTCIceCandidateSchema
});

// Termina chiamata
export const WebRTCEndCallSchema = z.object({
    type: z.literal('end-call'),
    to: z.number(),
});

// Rifiuta chiamata
export const WebRTCCallRejectSchema = z.object({
    type: z.literal('call-reject'),
    to: z.number(),
});

// Unione di tutti i tipi di messaggi WebRTC
export const WebRTCMessageSchema = z.discriminatedUnion('type', [ // <- usa discriminatedUnion per performance
    WebRTCOfferSchema,
    WebRTCAnswerSchema,
    WebRTCIceCandidateSchema,
    WebRTCEndCallSchema,
    WebRTCCallRejectSchema,
]);

// Types inferiti dagli schema
export type CallSession = z.infer<typeof CallSessionSchema>;
export type WebRTCOffer = z.infer<typeof WebRTCOfferSchema>;
export type WebRTCAnswer = z.infer<typeof WebRTCAnswerSchema>;
export type WebRTCIceCandidate = z.infer<typeof WebRTCIceCandidateSchema>;
export type WebRTCCallEnd = z.infer<typeof WebRTCEndCallSchema>;
export type WebRTCCallReject = z.infer<typeof WebRTCCallRejectSchema>;
export type WebRTCMessage = z.infer<typeof WebRTCMessageSchema>;