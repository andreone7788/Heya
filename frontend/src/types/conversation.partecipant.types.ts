import { z } from 'zod';

// Schema per contatto/utente disponibile per chat
export const ContactSchema = z.object({
  userId: z.number(),
  name: z.string(),
  surname: z.string(),
  username: z.string(),
  email: z.string().email(),
  status: z.enum(['PENDING', 'ACTIVE']),
  presence: z.enum(['online', 'offline', 'away']),
  address: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  unreadCount: z.number().optional()
});

export type Contact = z.infer<typeof ContactSchema>;

// Schema per lista contatti
export const ContactsListSchema = z.array(ContactSchema);

export type ContactsList = z.infer<typeof ContactsListSchema>;

// Schema per info utente in chat
export const UserChatInfoSchema = z.object({
  userId: z.number(),
  name: z.string(),
  surname: z.string(),
  username: z.string(),
  avatarUrl: z.string().nullable(),
  presenceStatus: z.enum(['ONLINE', 'OFFLINE', 'AWAY']),
  statusMessage: z.string().nullable().optional(),
});

export type UserChatInfo = z.infer<typeof UserChatInfoSchema>;