import { useState } from "react";
import { RegistrationApi } from "../api/user.api";
import { TextField, Button, Snackbar, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Register() {

    const navigate = useNavigate();

    const [error, setError] = useState<null | string>(null)
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState<null | string>(null)
    const [name, setName] = useState('')
    const [surname, setSurname] = useState('')
    const [username, setUsername] = useState('')
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const status: 'ACTIVE' | 'PENDING' = 'PENDING'
    const { t } = useTranslation()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        if (!name.trim()) return setError(t('common.requested'))
        if (!surname.trim()) return setError(t('common.requested'))
        if (!email.trim()) return setError(t('common.requested'))
        if (!username.trim()) return setError(t('common.requested'))
        setLoading(true)

        const payload = ({
            name: name.trim(),
            surname: surname.trim(),
            phone: phone.trim() === '' ? undefined : phone.trim(),
            username: username.trim(),
            address: address.trim() === '' ? undefined : address.trim(),
            email: email.trim(),
            status: status
        })

        try {
            const result = await RegistrationApi(payload)
            
            // Mostra messaggio di successo
            setSuccessMessage(result.message || "Registrazione completata! Attendi l'approvazione dell'amministratore.")
            
            // Redirect dopo 3 secondi
            setTimeout(() => {
                navigate('/')
            }, 3000)
            
        } catch (err) {
            setError(err instanceof Error ? err.message : t('login.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="section" style={{
            display: 'flex',
            justifyContent: 'center',
            minHeight: '100vh',
            alignItems: 'center',
            paddingTop: '6em'
        }}>
            <div className="form"
                style={{
                    height: 'auto',
                    width: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '2em',
                    backgroundColor: 'var(--camel)',
                    borderRadius: '50px',
                    color: 'var(--white)',
                    textAlign: 'center',
                    gap: '1.5em',
                    margin: '0.5em',
                    fontFamily: 'SATOSHI-VARIABLE',
                    fontSize: '0.8em',
                }}
            >
                <h1>Heya!</h1>
                <h3></h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
                    <div className="campo">
                        <TextField
                            required
                            id="name-outlined-required"
                            label={t('common.name')}
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoComplete="off"
                            disabled={loading}
                            sx={{
                                color: 'var(--brown)',
                                maxWidth: '100vw',
                                width: '100%',
                                '& .MuiInputLabel-root': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--beige)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--white)',
                                        borderRadius: '50px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                               '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--camel) inset',
                                    WebkitTextFillColor: 'var(--white)',
                                    borderRadius: '50px',
                                },
                            }}
                        />
                    </div>
                    <div className="campo">
                        <TextField
                            required
                            id="surname-outlined-required"
                            label={t('common.surname')}
                            type="text"
                            value={surname}
                            onChange={e => setSurname(e.target.value)}
                            autoComplete="off"
                            disabled={loading}
                            sx={{
                                color: 'var(--brown)',
                                maxWidth: '100vw',
                                width: '100%',
                                '& .MuiInputLabel-root': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--beige)',

                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--white)',
                                        borderRadius: '50px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--camel) inset',
                                    WebkitTextFillColor: 'var(--white)',
                                    borderRadius: '50px',
                                },
                            }}
                        />
                    </div>
                    <div className="campo">
                        <TextField
                            required
                            id="username-outlined-required"
                            label={t('common.username')}
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="off"
                            disabled={loading}
                            sx={{
                                color: 'var(--brown)',
                                maxWidth: '100vw',
                                width: '100%',
                                '& .MuiInputLabel-root': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--beige)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--white)',
                                        borderRadius: '50px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--camel) inset',
                                    WebkitTextFillColor: 'var(--white)',
                                    borderRadius: '50px',
                                },
                            }}
                        />
                    </div>

                    <div className="campo">
                        <TextField
                            required
                            id="email-outlined-required"
                            label={t('common.email')}
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="off"
                            disabled={loading}
                            sx={{
                                color: 'var(--brown)',
                                maxWidth: '100vw',
                                width: '100%',
                                '& .MuiInputLabel-root': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--beige)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--white)',
                                        borderRadius: '50px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--camel) inset',
                                    WebkitTextFillColor: 'var(--white)',
                                    borderRadius: '50px',
                                },
                            }}
                        />
                    </div>

                    <div className="campo">
                        <TextField
                            id="phone-outlined-required"
                            label={t('common.phone')}
                            type="text"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            autoComplete="off"
                            disabled={loading}
                            sx={{
                                color: 'var(--brown)',
                                maxWidth: '100vw',
                                width: '100%',
                                '& .MuiInputLabel-root': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--beige)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--white)',
                                        borderRadius: '50px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--camel) inset',
                                    WebkitTextFillColor: 'var(--white)',
                                    borderRadius: '50px',
                                },
                            }}
                        />
                    </div>

                    <div className="campo">
                        <TextField
                            id="address-outlined-required"
                            label={t('common.address')}
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            autoComplete="off"
                            disabled={loading}
                            sx={{
                                fontFamily: 'SATOSHI-VARIABLE',
                                color: 'var(--brown)',
                                maxWidth: '100vw',
                                width: '100%',
                                '& .MuiInputLabel-root': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--beige)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--white)',
                                        borderRadius: '50px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--beige)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--white)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--camel) inset',
                                    WebkitTextFillColor: 'var(--white)',
                                    borderRadius: '50px',
                                },
                            }}
                        />
                    </div>


                    <Button type="submit" variant="contained" color="primary" disabled={loading}
                        sx={{
                            backgroundColor: 'var(--brown)',
                            color: 'var(--white)',
                            borderRadius: '50px',
                            fontSize: '1.3em',
                            boxShadow: 'none',
                            textTransform: 'none',
                            fontFamily: 'SATOSHI-VARIABLE',
                            '&:hover': {
                                backgroundColor: 'var(--ivory)',
                                color: 'var(--brown)',
                                boxShadow: 'none',
                            }
                        }}
                    >{loading ? t('common.loading') : t('common.register')}</Button>

                    <Link to="/">
                        <Button type="button" variant="outlined" color="primary" disabled={loading}
                            sx={{
                                boxShadow: 'none',
                                color: 'var(--white)',
                                border: '1px solid var(--ivory)',
                                fontFamily: 'SATOSHI-VARIABLE',
                                textTransform: 'none',
                                fontSize: '1.3em',
                                borderRadius: '30px',
                                maxWidth: '100vw',
                                width: '100%',
                                '&:hover': {
                                    boxShadow: 'none',
                                    backgroundColor: 'var(--ivory)',
                                    color: 'var(--camel)'

                                }
                            }}
                        >{t('register.login')}</Button>
                    </Link>
                </form>

                {error && <p className="error">{error}</p>}
            </div>

            {/* Snackbar per successo */}
            <Snackbar 
                open={successMessage !== null} 
                autoHideDuration={3000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    severity="success" 
                    sx={{ 
                        fontFamily: 'SATOSHI-VARIABLE',
                        fontSize: '1em',
                        borderRadius: '20px'
                    }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>

            {/* Snackbar per errori */}
            <Snackbar 
                open={error !== null} 
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{ 
                        fontFamily: 'SATOSHI-VARIABLE',
                        fontSize: '1em',
                        borderRadius: '20px'
                    }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </div>
    )
}