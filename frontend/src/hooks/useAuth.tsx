import { useContext } from "react"
import { AuthUserContext } from "../context/authContext"
import { useTranslation } from "react-i18next"

export const useAuth = ()=> {
    const context = useContext(AuthUserContext)
    const {t} = useTranslation()
    if (!context) {
        throw new Error(t('hook.error'))
    }
    
    return context
}