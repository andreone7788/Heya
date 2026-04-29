//FEDERICA - CAMBIO PASSWORD
//ANDREA - CARICAMENTO AVATAR, AGGIORNAMENTO PROFILO

import { useState } from "react";
import { UpdateUserPasswordApi, UpdateAvatarUrlApi, UpdateUserProfileApi } from "../api/user.api";
import { Box, Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

export const ProfilePage = () => {
    const { user, checkAuth } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL.replace('/heya', ''); // Ottieni il dominio base
    const avatarFullUrl = user?.avatarUrl ? `${apiUrl}${user.avatarUrl}` : null;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<null | string>(null);
    const [success, setSuccess] = useState(false);
    const [password, setPassword] = useState('')
    const [oldPassword, setOldPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordNew, setShowPasswordNew] = useState(false);
    // Stati per upload avatar
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState<null | string>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    // Stati per aggiornamento profilo
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState<null | string>(null);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const { t } = useTranslation()
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        setSuccess(false)

        const user = {
            oldPassword,
            password
        }
        try {
            await UpdateUserPasswordApi(user)
            setSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : t('profile.error.password'))
        } finally {
            setLoading(false)
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setUploadError(t('profile.error.avatar'));
                return;
            }

            if (!file.type.startsWith('image/')) {
                setUploadError(t('profile.error.file'));
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setUploadError(null);
        }
    };

    const handleUploadAvatar = async () => {
        if (!selectedFile) return;

        setUploadLoading(true);
        setUploadError(null);
        setUploadSuccess(false);

        try {
            await UpdateAvatarUrlApi(selectedFile);
            setUploadSuccess(true);
            // Aggiorna il contesto utente per ottenere il nuovo avatar
            await checkAuth();
            // Pulisci la preview dopo un breve ritardo
            setTimeout(() => {
                setPreviewUrl(null);
                setSelectedFile(null);
            }, 2000);
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : t('profile.error.loading'));
        } finally {
            setUploadLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError(null);
        setProfileLoading(true);
        setProfileSuccess(false);

        const profileData = {
            username: username.trim() || undefined,
            phone: phone.trim() || undefined,
            address: address.trim() || undefined
        };

        try {
            await UpdateUserProfileApi(profileData);
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : t('profile.error.update'));
        } finally {
            setProfileLoading(false);
        }
    };

    return (
        <Box className="section" sx={{
            display: 'flex',
            justifyContent: 'center',
            minHeight: '100vh',
            alignItems: 'center',
            paddingTop: '4em',
            '@media (max-width: 870px)': {
                paddingTop: '7em'
            },

        }}>
            <Box id="profileForm"
                sx={{
                    height: 'auto',
                    maxWidth: '350px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '2em',
                    borderRadius: '50px',
                    color: 'var(--brown)',
                    textAlign: 'center',
                    gap: '1.5em',
                    margin: '0.5em',
                    fontFamily: 'SATOSHI-VARIABLE',
                    fontSize: '0.8em',
                    '@media (min-width: 870px)': {
                        maxWidth: '600px',
                    },
                    '@media (min-width: 1200px)': {
                        maxWidth: '700px',
                    },
                }}>
                <h1>{t('profile.title')}</h1>

                {/* Sezione Modifica Profilo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
                    <h2>{t('profile.info.title')}</h2>
                    <form onSubmit={handleUpdateProfile}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
                        <div className="campo">
                            <TextField
                                label={t('common.username')}
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={profileLoading}
                                fullWidth
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
                                label={t('common.phone')}
                                variant="outlined"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={profileLoading}
                                fullWidth
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
                                label={t('common.address')}
                                variant="outlined"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                disabled={profileLoading}
                                fullWidth
                                multiline
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

                        <Button type="submit" variant="contained" color="primary" disabled={profileLoading}
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
                            {profileLoading ? t('common.loading') : t('common.save')}
                        </Button>
                    </form>

                    {profileError && <p style={{ color: 'red', fontFamily: 'SATOSHI-VARIABLE', }}>{profileError}</p>}
                    {profileSuccess && <p style={{ color: 'green', fontFamily: 'SATOSHI-VARIABLE', }}>{t('profile.info.success')}</p>}
                </div>

                <hr style={{ border: '1px solid var(--beige)' }} />

                {/* Sezione Avatar */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5em',
                        padding: '1em',
                        border: '1px solid var(--beige)',
                        borderRadius: '20px',
                        backgroundColor: 'var(--light-beige)',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <h2 style={{ fontFamily: 'SATOSHI-VARIABLE', color: 'var(--brown)' }}>
                        {t('profile.info.avatar')}
                    </h2>

                    {/* Mostra l'avatar corrente dell'utente */}
                    {avatarFullUrl && !previewUrl && (
                        <div>
                            <img
                                src={avatarFullUrl}
                                alt="Avatar attuale"
                                style={{
                                    width: 150,
                                    height: 150,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    display: 'block',
                                    margin: '10px 0',
                                    border: '1px solid var(--camel)',
                                }}
                            />
                        </div>
                    )}

                    {/* Mostra l'anteprima del nuovo avatar selezionato */}
                    {previewUrl && (
                        <img
                            src={previewUrl}
                            alt={t('common.preview')}
                            style={{
                                width: 150,
                                height: 150,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                display: 'block',
                                margin: '10px 0',
                                border: '1px dashed var(--camel)',
                            }}
                        />
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1em' }}>
                        {/* Input file nascosto */}
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploadLoading}
                            style={{ display: 'none' }} // Nascondi l'input file
                        />

                        {/* Etichetta stilizzata che funge da pulsante */}
                        <label
                            htmlFor="file-upload"
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                backgroundColor: 'var(--camel)',
                                color: 'var(--white)',
                                borderRadius: '30px',
                                fontFamily: 'SATOSHI-VARIABLE',
                                fontSize: '1.2em',
                                cursor: 'pointer',
                                textAlign: 'center',
                                boxShadow: 'none',
                                transition: 'background-color 0.3s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--dove)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--camel)')}
                        >
                            {t('common.avatar')} {/* Testo del pulsante */}
                        </label>

                        {/* Mostra il nome del file selezionato */}
                        {selectedFile && (
                            <p
                                style={{
                                    fontFamily: 'SATOSHI-VARIABLE',
                                    color: 'var(--brown)',
                                    fontSize: '1em',
                                    margin: '0',
                                }}
                            >
                                {selectedFile.name}
                            </p>
                        )}

                        {/* Pulsante per caricare l'avatar */}
                        {selectedFile && (
                            <Button
                                onClick={handleUploadAvatar}
                                disabled={uploadLoading}
                                variant="contained"
                                style={{
                                    boxShadow: 'none',
                                    color: 'var(--white)',
                                    backgroundColor: 'var(--camel)',
                                    fontFamily: 'SATOSHI-VARIABLE',
                                    textTransform: 'none',
                                    fontSize: '1.2em',
                                    borderRadius: '30px',
                                    padding: '10px 20px',
                                    transition: 'background-color 0.3s',
                                }}
                            >
                                {uploadLoading ? t('common.loading') : t('common.approve')}
                            </Button>
                        )}
                    </div>

                    {/* Messaggi di errore o successo */}
                    {uploadError && (
                        <p style={{ color: 'red', fontFamily: 'SATOSHI-VARIABLE', fontSize: '1em' }}>
                            {uploadError}
                        </p>
                    )}
                    {uploadSuccess && (
                        <p style={{ color: 'green', fontFamily: 'SATOSHI-VARIABLE', fontSize: '1em' }}>
                            {t('profile.info.load')}
                        </p>
                    )}
                </div>

                <hr style={{ border: '1px solid var(--beige)' }} />

                {/* Sezione Password */}
                <h2>{t('profile.info.change')}</h2>
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
                    <div className="campo">
                        <FormControl variant="outlined" fullWidth
                            sx={{
                                color: 'var(--camel)',
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
                                        borderColor: 'var(--camel)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--camel)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--brown)',
                                    fontFamily: 'SATOSHI-VARIABLE', // Cambia il colore del testo inserito
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--ivory) inset',
                                    WebkitTextFillColor: 'var(--camel)',
                                    borderRadius: 'inherit',
                                },
                            }}>
                            <InputLabel htmlFor="old-password">{t('profile.info.old')}</InputLabel>
                            <OutlinedInput
                                required
                                id="old-password"
                                type={showPassword ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                autoComplete="current-password"
                                disabled={loading}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{ color: 'var(--camel)' }}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label={t('profile.info.old')}
                            />
                        </FormControl>
                    </div>

                    <div className="campo">
                        <FormControl variant="outlined" fullWidth
                            sx={{
                                color: 'var(--camel)',
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
                                        borderColor: 'var(--camel)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--camel)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--brown)',
                                    fontFamily: 'SATOSHI-VARIABLE', // Cambia il colore del testo inserito
                                },
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px var(--ivory) inset',
                                    WebkitTextFillColor: 'var(--camel)',
                                    borderRadius: 'inherit',
                                },
                            }}>
                            <InputLabel htmlFor="new-password">{t('profile.info.new')}</InputLabel>
                            <OutlinedInput
                                required
                                id="new-password"
                                type={showPasswordNew ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="new-password"
                                disabled={loading}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPasswordNew(!showPasswordNew)}
                                            edge="end"
                                            sx={{ color: 'var(--camel)' }}
                                        >
                                            {showPasswordNew ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label={t('profile.info.new')}
                            />
                        </FormControl>
                    </div>

                    <Button type="submit" variant="contained" color="primary" disabled={loading}
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
                        {loading ? t('common.loading') : t('profile.info.change')}
                    </Button>
                </form>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{t('profile.info.update')}</p>}
            </Box>
        </Box>
    );
}