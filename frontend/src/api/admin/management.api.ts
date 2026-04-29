import { CreateUserSchema, TypeCreateUserSchema, TypePendingSchema,TypeUserSchema } from "../../types/user.types";

const apiUrl = import.meta.env.VITE_API_URL
const HEADER = { "Content-Type": "application/json" }

// api per ottenere la lista di utenti

export const UserListApi = async():Promise<TypeUserSchema[]> => {
    const url = `${apiUrl}/management/load`

    const response = await fetch(url,{
        method: 'GET',
        credentials: 'include'
    })

    if(!response.ok) throw new Error('impossibile recuperare i dati')
    return response.json()
};

//api per ottenere la lista di utenti pending

export const UserListPendingApi = async():Promise<TypePendingSchema[]> => {
    const url = `${apiUrl}/management/load/pending`

    const response = await fetch(url,{
        method: 'GET',
        credentials: 'include'
    })

    if(!response.ok) throw new Error('impossibile recuperare i dati')
    return response.json()
};

// API per la creazione di un nuovo utente (admin)
export const CreateUserApi = async(payload: TypeCreateUserSchema): Promise<TypeCreateUserSchema> => {
    const url = `${apiUrl}/management/create`

     const validCredential = CreateUserSchema.safeParse(payload)
    
        if(!validCredential.success) {
            console.error('CreateUser validation failed:', validCredential.error.format())
            throw new Error("Dati di creazione non validi" + JSON.stringify(validCredential.error.format()))
        }

    const cleanData = Object.fromEntries(
        Object.entries(validCredential.data).filter(([, value]) => value !== undefined)
    );

    const response = await fetch(url, {
        method: 'POST',
        headers: HEADER,
        credentials: 'include',
        body: JSON.stringify(cleanData)
    })

    if (!response.ok) throw new Error('impossibile creare l\'utente')
    return response.json()
};

// API per l'accettazione di un nuovo utente (admin)
export const ApproveUserApi = async(requestId:number): Promise<TypePendingSchema> => {
    const url = `${apiUrl}/management/approve/${requestId}`
    
     const response = await fetch(url, {
        method: 'PUT',
        headers: HEADER,
        credentials: 'include'
    })

    if (!response.ok) throw new Error('impossibile creare l\'utente')
    return response.json()
};


// API per la cancellazione di un utente (admin)
export const DeleteUserApi = async(userId: number):Promise<void> => {
    const url = `${apiUrl}/management/delete/${userId}`

    const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
    })

    if (response.status === 401) {
        throw new Error('Non autenticato')
    }

    if (!response.ok) throw new Error('impossibile cancellare l\'utente')
}

// API per la cancellazione di un utente pending (admin)
export const DeleteUserPendingApi = async(id: number):Promise<void> => {
    const url = `${apiUrl}/management/delete/pending/${id}`

    const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
    })

    if (response.status === 401) {
        throw new Error('Non autenticato')
    }

    if (!response.ok) throw new Error('impossibile cancellare l\'utente')
}