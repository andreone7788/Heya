import { useState } from "react";
import { CheckSessionApi } from "../api/user.api";
import { TextField, Button, IconButton, InputAdornment, InputLabel, OutlinedInput, FormControl } from "@mui/material";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useTranslation()
    const [error, setError] = useState<null | string>(null)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!email.trim()) return setError(t('common.requested'))
        if (!password.trim()) return setError(t('common.requested'))
        setLoading(true)

        const credentials = ({
            email: email.trim(),
            password: password.trim()
        })

        try {
            await login(credentials)

            const userData = await CheckSessionApi()
            if (userData.user?.role === 'admin') {
                navigate('/HeyaManagementUser')
            } else {
                navigate('/HeyaChat')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('login.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="section"
            style={{
                display: 'flex',
                justifyContent: 'center',
                minHeight: '100vh',
                alignItems: 'center'
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
                <h1>{t('login.title')}</h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
                    <div className="campo">
                        <TextField
                            required
                            id='outlined-required'
                            label={t('common.email')}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete='off'
                            disabled={loading}
                            sx={{
                                color: 'var(--white)',
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
                                    '& input': {
                                        color: 'var(--white)',
                                        fontFamily: 'SATOSHI-VARIABLE',// Cambia il colore del testo inserito
                                    },
                                    '& input:-webkit-autofill': {
                                        WebkitBoxShadow: '0 0 0 100px var(--ivory) inset',
                                        WebkitTextFillColor: 'var(--camel)',
                                        borderRadius: 'inherit',
                                    },
                                },
                            }}
                        />
                    </div>

                    <div className="campo">
                        <FormControl variant="outlined"
                            sx={{
                                color: 'var(--white)',
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
                                    fontFamily: 'SATOSHI-VARIABLE', // Cambia il colore del testo inserito
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--ivory) inset',
                                    WebkitTextFillColor: 'var(--camel)',
                                    borderRadius: 'inherit',
                                },
                            }}
                        >
                            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                            <OutlinedInput
                                required
                                id="outlined-adornment-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="new-password"
                                disabled={loading}

                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={
                                                showPassword ? 'hide the password' : 'display the password'
                                            }
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{ color: 'var(--white)' }}

                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label={t('common.password')}
                            />
                        </FormControl>
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
                    >{loading ? t('common.loading') : t('common.login')}</Button>
                    <Link to="/register">
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
                            }}>{t('login.register')}</Button>
                    </Link>
                </form>

                {error && <p className="error">{error}</p>}
            </div>
        </div>
    )
}