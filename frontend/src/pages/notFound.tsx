import { Button } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export const NotFound = () => {
    const { t } = useTranslation()
    const { user } = useAuth()
    const buttonContent = !user ? (
        <Link to="/">
            <Button variant="contained" color="primary" type="button"
             sx={{
                            boxShadow: 'none',
                            color: 'var(--white)',
                            backgroundColor: 'var(--camel)',
                            fontFamily: 'SATOSHI-VARIABLE',
                            textTransform: 'none',
                            fontSize: '1.3em',
                            borderRadius: '30px',
                            '&:hover': {
                                boxShadow: 'none',
                                backgroundColor: 'var(--dove)'
                            }
                        }}>
                {t('notFound.guest')}
            </Button>
        </Link>
    ) : user.role === 'admin' ? (
        <Link to="/HeyaManagement">
            <Button variant="contained" color="primary" type="button"
             sx={{
                            boxShadow: 'none',
                            color: 'var(--white)',
                            backgroundColor: 'var(--camel)',
                            fontFamily: 'SATOSHI-VARIABLE',
                            textTransform: 'none',
                            fontSize: '1.3em',
                            borderRadius: '30px',
                            '&:hover': {
                                boxShadow: 'none',
                                backgroundColor: 'var(--dove)'
                            }
                        }}>
                {t('notFound.admin')}
            </Button>
        </Link>
    ) : (
        <Link to="/HeyaChat">
            <Button variant="contained" color="primary" type="button"
             sx={{
                            boxShadow: 'none',
                            color: 'var(--white)',
                            backgroundColor: 'var(--camel)',
                            fontFamily: 'SATOSHI-VARIABLE',
                            textTransform: 'none',
                            fontSize: '1.3em',
                            borderRadius: '30px',
                            '&:hover': {
                                boxShadow: 'none',
                                backgroundColor: 'var(--dove)'
                            }
                        }}>
                {t('notFound.user')}
            </Button>
        </Link>
    )

    return (
        <div id='notfound-container' style={{
            fontFamily: 'SATOSHI-VARIABLE',
            fontSize: '0.7em',
            display: 'flex',
            flexDirection:'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            maxWidth: '100vw',
            width:'100%',
            padding: '1em',
            textAlign: 'center',
            boxSizing: 'border-box',
            gap: '1em'
        }}>
            <h1>{t('notFound.title')}</h1>
            {buttonContent}
        </div>
    )
}