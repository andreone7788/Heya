import { ReactNode } from "react";
import z from "zod";

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(16)
})

export const UpdatePassSchema = z.object({
    oldPassword: z.string().min(8).max(16),
    password: z.string().min(8).max(16),
});

export const UpdateProfileSchema = z.object({
    username: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
});
 
export const UserSchema = z.object({
    userId: z.number(),
    name: z.string(),
    surname: z.string(),
    username: z.string(),
    email: z.string().email(),
    status: z.enum(["PENDING","ACTIVE"]),
    address: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional()
    
})

// definizione dello schema per la registrazione (status predefinito a "pending" con password opzionale)
export const PendingSchema = z.object({
    id: z.number(),
    name: z.string(),
    surname: z.string(),
    username: z.string(),
    message: z.string().optional(),
    email: z.string().email(),
    status: z.enum(["PENDING","ACTIVE"]),
    address: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    avatar: z.string().optional().nullable()
});

export const UserSchemaExtended = UserSchema.extend({
    password: z.string().min(8).max(16)

})

export const CreateUserSchema = z.object({
    name: z.string(),
    surname: z.string(),
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(8).max(16).optional(),
    address: z.string().optional(),
    phone: z.string().optional()
})

export const AuthSchema = z.object({
    userId: z.number(),
    email: z.string().email(),
    role: z.enum(["admin", "user"]),
    name: z.string(),
    surname: z.string(),
    avatarUrl: z.string().optional()
})

export const checkAuthSchema = z.object({
    isAuth: z.boolean(),
    user: AuthSchema.optional()
})

export const DeleteUser = z.object({
    userId: z.number(),
    username: z.string()
})


export const DeletePendingUser = z.object({
    id: z.number(),
    username: z.string()
})

// definizione dello schema per la registrazione (status predefinito a "pending" con password opzionale)
export const RegisterSchema = z.object({
    name: z.string(),
    surname: z.string(),
    username: z.string(),
    email: z.email(),
    address: z.string().optional(),
    phone: z.string().optional()
});

// tipi per context e providerÃ¹
export type TypeAuthContext = {
    user: typeAuthSchema | null,
    isAuth: boolean,
    loading: boolean,
    isAdmin: boolean,
    login: (payload:TypeLoginSchema) => Promise<void>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
}

export type AuthProviderProp = {
    children: ReactNode
}


export type TypePendingSchema = z.infer<typeof PendingSchema>
export type typeAuthSchema = z.infer<typeof AuthSchema>
export type TypeLoginSchema = z.infer<typeof LoginSchema>
export type TypeUserSchema = z.infer<typeof UserSchema>
export type TypeCreateUserSchema = z.infer<typeof CreateUserSchema>
export type TypeUserSchemaExtended = z.infer<typeof UserSchemaExtended>
export type TypeCheckAuthSchema = z.infer<typeof checkAuthSchema>
export type TypeDeletePendingUser = z.infer<typeof DeletePendingUser>
export type TypeDeleteUser = z.infer<typeof DeleteUser>
export type TypeRegister = z.infer<typeof RegisterSchema>;
export type TypeUpdatePassSchema = z.infer<typeof UpdatePassSchema>
export type TypeUpdateProfileSchema = z.infer<typeof UpdateProfileSchema>