import { TypeLoginSchema, LoginSchema, TypeCheckAuthSchema, checkAuthSchema, typeAuthSchema, TypeRegister, RegisterSchema, UpdatePassSchema, TypeUpdatePassSchema, TypeUpdateProfileSchema, UpdateProfileSchema, TypePendingSchema } from "../types/user.types";

const apiUrl = import.meta.env.VITE_API_URL
const HEADER = { "Content-Type": "application/json" }


//login

export const LoginApi = async (payload: TypeLoginSchema): Promise<typeAuthSchema> => {
    const url = `${apiUrl}/user/login`
    const validCredential = LoginSchema.safeParse(payload)

    if (!validCredential.success) throw new Error("Dati di login non validi")

    const response = await fetch(url, {
        method: 'POST',
        headers: HEADER,
        credentials: 'include',
        body: JSON.stringify(validCredential.data)
    })

    if (!response.ok) throw new Error("email o password errati")

    const authData = await CheckSessionApi()

    if (!authData.isAuth || !authData.user) {
        throw new Error('Login fallito: sessione non creata')
    }

    return authData.user
}

//logout

export const LogoutApi = async (): Promise<void> => {
    const url = `${apiUrl}/user/logout`

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include'
    })

    if (!response.ok) throw new Error("Logout fallito")
    
}

// registrazione
export const RegistrationApi = async (payload: TypeRegister): Promise<TypePendingSchema> => {
    const url = `${apiUrl}/user/register`
    const validCredential = RegisterSchema.safeParse(payload)

    if (!validCredential.success) throw new Error("Dati di registrazione non validi")
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: HEADER,
            credentials: 'include',
            body: JSON.stringify(validCredential.data)
        })

        if (!response.ok) throw new Error("dati di registrazione errati")

        const result = await response.json()
        return result
    } catch (error) {
        console.error("ERRORE CATCH:", error)
        throw error
    }
}

// controllo sessione

export const CheckSessionApi = async (): Promise<TypeCheckAuthSchema> => {
    try {
        const url = `${apiUrl}/user/session`

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        })

        if (response.status === 401) {
            return { isAuth: false }
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        const validResponse = checkAuthSchema.safeParse(data)

        if (!validResponse.success) {

            throw new Error('formato risposta non valido')
        }
        return validResponse.data

    } catch {
        return { isAuth: false }
    }
}

//aggiornare la password

export const UpdateUserPasswordApi = async(payload:TypeUpdatePassSchema) => {
   const url = `${apiUrl}/user/update`
    const validCredential = UpdatePassSchema.safeParse(payload)

    if (!validCredential.success) throw new Error("Dati di registrazione non validi")
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: HEADER,
            credentials: 'include',
            body: JSON.stringify(validCredential.data)
        })

        if (!response.ok) throw new Error("dati di registrazione errati")


        const result = await response.json()
        return result
    } catch (error) {
        console.error("ERRORE CATCH:", error)
        throw error
    }
}


//caricare avatar image

export const UpdateAvatarUrlApi = async(file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const url = `${apiUrl}/user/upload-avatar`

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData
    })

    if (!response.ok) throw new Error("Upload avatar fallito")

    const result = await response.json()
    return result
}

//aggiornare info di profilo

export const UpdateUserProfileApi = async(payload: TypeUpdateProfileSchema) => {
    const url = `${apiUrl}/user/update-profile`
    const result = UpdateProfileSchema.safeParse(payload)

    if (!result.success) {
        console.error("Dati di aggiornamento profilo non validi:", result.error);
        throw new Error("Dati di aggiornamento profilo non validi");
    }

    const response = await fetch(url, {
        method: 'PUT',
        headers: HEADER,
        credentials: 'include',
        body: JSON.stringify(result.data)
    })

    if (!response.ok) throw new Error("Aggiornamento profilo fallito")

    const data = await response.json()
    return data
}

