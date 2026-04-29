import { z } from 'zod';

// Schema per conversazione
export const ConversationSchema = z.object({
  id: z.number(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  participants: z.array(
    z.object({
      userId: z.number(),
      conversationId: z.number(),
      user: z.object({
        userId: z.number(),
        name: z.string(),
        surname: z.string(),
        username: z.string(),
        avatarUrl: z.string().nullable(),
        presenceStatus: z.enum(['ONLINE', 'OFFLINE', 'AWAY']),
      }),
    })
  ),
  messages: z.array(
    z.object({
      id: z.number(),
      content: z.string(),
      createdAt: z.string().or(z.date()),
      senderId: z.number(),
      isRead: z.boolean(),
    })
  ).optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

// Schema per lista conversazioni
export const ConversationsListSchema = z.array(ConversationSchema);

export type ConversationsList = z.infer<typeof ConversationsListSchema>;