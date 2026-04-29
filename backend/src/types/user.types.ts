import z from 'zod';

// definizione dello schema per la creazione di un nuovo utente
export const CreateUserSchema = z.object({
    name: z.string(),
    surname: z.string(),
    username: z.string(),
    email: z.email(),
    password: z.string().min(8).max(16).optional(),
    address: z.string().optional(),
    phone: z.string().optional()
})

// definizione dello schema per la registrazione (status predefinito a "pending" con password opzionale)
export const RegisterSchema = z.object({
    name: z.string(),
    surname: z.string(),
    username: z.string(),
    email: z.email(),
    address: z.string().optional().nullable(),
    phone: z.string().optional().nullable()
});

// definizione dello schema per la registrazione (status predefinito a "pending" con password opzionale)
export const PendingSchema = z.object({
    id: z.number(),
    name: z.string(),
    surname: z.string(),
    username: z.string(),
    email: z.string().email(),
    status: z.enum(["PENDING","ACTIVE"]),
    address: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    avatar: z.string().optional().nullable()
});

// definizione dello schema per il login
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(16),
});


export const UpdatePassSchema = z.object({
    oldPassword: z.string().min(8).max(16),
    password: z.string().min(8).max(16),
});

// Schema per aggiornamento profilo (campi opzionali)
export const UpdateProfileSchema = z.object({
    username: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
});


// definizione dello schema per ottenere l'utente (completo di id e campi facoltativi)
export const UserSchema = z.object({
    userId: z.number(),
    name: z.string(),
    surname: z.string(),
    username: z.string(),
    email: z.string().email(),
    status: z.enum(["PENDING","ACTIVE"]),
    address: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    presence: z.enum(["online", "offline", "away"])
    
})


export type TypePendingSchema = z.infer<typeof PendingSchema>;
export type TypeCreateUser = z.infer<typeof CreateUserSchema>;
export type TypeRegister = z.infer<typeof RegisterSchema>;
export type TypeLogin = z.infer<typeof LoginSchema>;
export type TypeUser = z.infer<typeof UserSchema>
export type TypeUpdatePassSchema=z.infer<typeof UpdatePassSchema>
export type TypeUpdateProfileSchema=z.infer<typeof UpdateProfileSchema>