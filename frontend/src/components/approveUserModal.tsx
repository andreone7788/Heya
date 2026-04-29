import { useState } from "react";
import { TypePendingSchema } from "../types/user.types";
import { Button, Modal} from "@mui/material";
import { ApproveUserApi} from "../api/admin/management.api";
import { useTranslation } from "react-i18next";

type ApproveProp = {
    user : TypePendingSchema | null
    onclose: () => void
    onopen:boolean
    onapprove?: () => void
}
export const ApproveUserModal = ({ user, onclose, onopen, onapprove}: ApproveProp) => {
    const { t } = useTranslation()
    const [error, setError] = useState<null | string>(null);
    const [loading, setLoading] = useState(false);

    async function handleApprove(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
       
        setLoading(true)

       
        try {
            if(user !== null){
            await ApproveUserApi(user.id)
            if(onapprove) onapprove()
            onclose()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('approve.error'))
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
                    width: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '3em',
                    backgroundColor: 'var(--ivory)',
                    borderRadius: '50px',
                    color: 'var(--camel)',
                    textAlign: 'center',
                    gap: '1.5em',
                    margin: '0.5em',
                    fontFamily: 'SATOSHI-VARIABLE',
                    fontSize: '0.8em',
                }}>
            {user && <h1>{t('approve.title')} "{user.username}"?</h1>}

             <Button onClick={handleApprove} variant="contained" color="secondary" disabled={loading}
             sx={{
                            boxShadow: 'none',
                            color: 'var(--white)',
                            backgroundColor:'var(--camel)',
                            fontFamily: 'SATOSHI-VARIABLE',
                            textTransform: 'none',
                            fontSize: '1.3em',
                            borderRadius: '30px',
                            '&:hover': {
                                boxShadow: 'none',
                                backgroundColor: 'var(--dove)'
                            }
                        }}
             >{loading ? t('common.loading') : t('common.approve')}</Button>
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
                        }}
            >{loading ? t('common.loading') : t('common.cancel')}</Button>

            {error && <p className="error">{error}</p>}

            </div>

        </Modal>
        
    )
}