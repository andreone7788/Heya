import { useState } from "react";
import { TypeCreateUserSchema } from "../types/user.types";
import { Button, Modal, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

type CreateProp = {
    onsubmit: (u: TypeCreateUserSchema) => Promise<void> | void
    onclose: () => void
    onopen: boolean
}
export const CreateUser = ({ onsubmit, onclose, onopen }: CreateProp) => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('');
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState('')
    const [error, setError] = useState<null | string>(null);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        if (!name.trim()) return setError(t('common.requested'))
        if (!surname.trim()) return setError(t('common.requested'))
        if (!email.trim()) return setError(t('common.requested'))
        if (!username.trim()) return setError(t('common.requested'))
        setLoading(true)

        const payload = {
            name: name.trim(),
            surname: surname.trim(),
            phone: phone.trim() === '' ? undefined : phone.trim(),
            username: username.trim(),
            address: address.trim() === '' ? undefined : address.trim(),
            email: email.trim()

        }
        try {
            await onsubmit(payload)
            onclose()
        } catch (err) {
            setError(err instanceof Error ? err.message : t('create.error'))
        } finally {
            setLoading(false)
        }
    }

    return (


        <Modal
            open={onopen}
            onClose={onclose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{
                display: 'flex',
                bottom: 'auto',
                left: 'auto',
                right: 'auto',
                minHeight: '100vh',
                maxWidth: '100vw',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 20,
            }}
        >

            <div id="modal"
                style={{
                    height: 'auto',
                    maxWidth: '500px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '2em',
                    backgroundColor: 'var(--ivory)',
                    borderRadius: '50px',
                    color: 'var(--camel)',
                    textAlign: 'center',
                    gap: '1.5em',
                    margin: '1em',
                    fontFamily: 'SATOSHI-VARIABLE',
                    fontSize: '0.8em',
                }}>
                <h1>{t('create.title')}</h1>

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
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--brown)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'transparent !important',
                                    '& fieldset': {
                                        borderColor: 'var(--camel)',
                                        borderRadius: '50px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--brown)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--brown)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE', // Cambia il colore del testo inserito
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--ivory) inset',
                                    WebkitTextFillColor: 'var(--camel)',
                                    borderRadius: 'inherit',
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
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--brown)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--camel)',
                                        borderRadius: '50px',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--brown)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE', // Cambia il colore del testo inserito
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--ivory) inset',
                                    WebkitTextFillColor: 'var(--camel)',
                                    borderRadius: 'inherit',
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
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--brown)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--camel)',
                                        borderRadius: '50px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--brown)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--brown)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE', // Cambia il colore del testo inserito
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--ivory) inset',
                                    WebkitTextFillColor: 'var(--camel)',
                                    borderRadius: 'inherit',
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
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--brown)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--camel)',
                                        borderRadius: '50px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--brown)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--brown)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE', // Cambia il colore del testo inserito
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--ivory) inset',
                                    WebkitTextFillColor: 'var(--camel)',
                                    borderRadius: 'inherit',
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
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--brown)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--camel)',
                                        borderRadius: '50px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--brown)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--brown)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE', // Cambia il colore del testo inserito
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--ivory) inset',
                                    WebkitTextFillColor: 'var(--camel)',
                                    borderRadius: 'inherit',
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
                                color: 'var(--brown)',
                                maxWidth: '100vw',
                                width: '100%',
                                '& .MuiInputLabel-root': {
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'var(--brown)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--camel)',
                                        borderRadius: '50px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--brown)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--brown)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE', // Cambia il colore del testo inserito
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--ivory) inset',
                                    WebkitTextFillColor: 'var(--camel)',
                                    borderRadius: 'inherit',
                                },
                            }}
                        />
                    </div>
                    <Button type="submit" variant="contained" disabled={loading}
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
                        }}
                    >{loading ? t('common.loading') : t('common.create')}</Button>
                    <Button type="button" variant="outlined" disabled={loading} onClick={onclose}
                        sx={{
                            boxShadow: 'none',
                            color: 'var(--camel)',
                            border: '1px solid var(--camel)',
                            fontFamily: 'SATOSHI-VARIABLE',
                            textTransform: 'none',
                            fontSize: '1.3em',
                            borderRadius: '30px',
                            '&:hover': {
                                boxShadow: 'none',
                                backgroundColor: 'var(--camel)',
                                color: 'var(--white)'

                            }
                        }}>{loading ? t('common.loading') : t('common.cancel')}</Button>
                </form>

                {error && <p className="error">{error}</p>}

            </div>

        </Modal>

    )
}