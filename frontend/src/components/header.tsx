import { useTranslation } from "react-i18next"
import { Link, NavLink } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useState } from "react"
import "./style/header.css"
import { ButtonGroup, Button } from "@mui/material"

export const Header = () => {
    const { t, i18n } = useTranslation()
    const { isAuth, user, logout } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleClick = async () => {
        setError(null)
        setIsLoading(true)
        try {
            await logout()
        } catch (err) {
            setError(err instanceof Error ? err.message : t('header.error'))
        } finally {
            setIsLoading(false)
        }
    }

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang)
        localStorage.setItem('language', lang)  // Salva preferenza
    }

    const currentLanguage = i18n.language

    return (
        <div id='navbar'>
            {/* Riga superiore */}
            <div className="navbar-top">
                <div id='logo'>
                    <img src="/heya_logo.svg" alt="Heya! Logo" />
                </div>
                <div className="language-switcher item">
                    <ButtonGroup variant="text" aria-label="Basic button group">
                        <Button onClick={() => changeLanguage('it')}
                            className={currentLanguage === 'it' ? 'active' : ''}
                            aria-label="Italiano"
                            sx={{
                                borderTopLeftRadius: '20px',
                                borderBottomLeftRadius: '20px'

                            }}>IT</Button>
                        <Button onClick={() => changeLanguage('en')}
                            className={currentLanguage === 'en' ? 'active' : ''}
                            aria-label="English"
                            sx={{
                                borderTopRightRadius: '20px',
                                borderBottomRightRadius: '20px'

                            }}
                        >EN</Button>
                    </ButtonGroup>
                </div>

                <div>
                    {isAuth && user ? (
                        <Button type="button" variant="contained" onClick={handleClick} disabled={isLoading}
                            sx={{
                                backgroundColor: 'var(--brown)',
                                color: 'var(--white)',
                                borderRadius: '50px',
                                fontSize: '1em',
                                boxShadow: 'none',
                                textTransform: 'none',
                                fontFamily: 'SATOSHI-VARIABLE',
                                '&:hover': {
                                    backgroundColor: 'var(--ivory)',
                                    color: 'var(--brown)',
                                    boxShadow: 'none',
                                }
                            }}
                        >
                            {isLoading ? t('common.loading') : t('common.logout')}
                        </Button>
                    ) : (
                        <Link to='/'>
                            <Button type="button" variant="contained"
                                sx={{
                                    backgroundColor: 'var(--brown)',
                                    color: 'var(--white)',
                                    borderRadius: '50px',
                                    fontSize: '1em',
                                    boxShadow: 'none',
                                    textTransform: 'none',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                    '&:hover': {
                                        backgroundColor: 'var(--ivory)',
                                        color: 'var(--brown)',
                                        boxShadow: 'none',
                                    }
                                }}>{t('common.login')}</Button>
                        </Link>
                    )}
                </div>


            </div>

            {/* Riga inferiore */}
            <div className="navbar-bottom" style={{
                display: isAuth && user && (user.role === 'user' || user.role === 'admin') ? 'block' : 'none'
            }}>
                {isAuth && user ? (
                    <>
                        {user.role === 'user' ? (
                            <nav className='nav'>
                                <NavLink to='/HeyaProfile' className={({ isActive }) => isActive ? 'active' : ''}>{t('header.profile')}</NavLink>
                                <NavLink to='/HeyaChat' className={({ isActive }) => isActive ? 'active' : ''}>{t('header.chat')}</NavLink>
                            </nav>
                        ) : null}
                        {user.role === 'admin' ? (
                            <nav className='nav'>
                                <NavLink to='/HeyaManagementUser'>{t('header.activeUsers')}</NavLink>
                                <NavLink to='/HeyaManagementRequest'>{t('header.pendingUsers')}</NavLink>
                            </nav>
                        ) : null}
                    </>
                ) : null}
            </div>
            {error && <p className="error">{error}</p>}
        </div>
    )

}