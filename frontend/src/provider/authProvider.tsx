import { useEffect, useState } from "react"
import { AuthProviderProp, TypeLoginSchema } from "../types/user.types"
import { typeAuthSchema } from "../types/user.types"
import { AuthUserContext } from "../context/authContext"
import { CheckSessionApi, LoginApi, LogoutApi} from "../api/user.api"
import { useTranslation } from "react-i18next"

export const AuthProvider: React.FC<AuthProviderProp> = ({children}) => {
    const [user, setUser] = useState<typeAuthSchema | null>(null)
    const [loading, setLoading] = useState(true)
    const isAuth = Boolean(user)
    const isAdmin = user?.role === 'admin'
    const {t} = useTranslation()

    const checkAuth = async() => {
        try{
            const data = await CheckSessionApi()
            if(data.isAuth && data.user) {
                setUser(data.user)
            }else{
                setUser(null)
            }
        }catch(err){
            console.error(t('provider.error'))
            setUser(null)
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    const login = async(payload: TypeLoginSchema) => {
        setLoading(true)
        try {
            const userData =await LoginApi(payload)
            setUser(userData)
        } catch (err) {
            throw err
        }finally{
            setLoading(false)
        }
        
    }

      const logout = async()=> {
        setLoading(true)
        try {
            await LogoutApi()
            setUser(null)
        } catch (err) {
            console.error(t('provider.logout'), err)
        }finally{
            setLoading(false)
        }
    }


    return(
        <AuthUserContext.Provider value={{
            user,
            isAuth,
            loading,
            isAdmin,
            login,
            logout,
            checkAuth

        }}>
        {children}
        </AuthUserContext.Provider>
    )
}