import { useState } from "react";
import { TypeDeletePendingUser} from "../types/user.types";
import { Button, Modal} from "@mui/material";
import { DeleteUserPendingApi } from "../api/admin/management.api";
import { useTranslation } from "react-i18next";

type DeleteProp = {
    user : TypeDeletePendingUser | null
    onclose: () => void
    onopen:boolean
    ondelete?: () => void
}
export const DeleteUserPendingModal = ({ user, onclose, onopen, ondelete}: DeleteProp) => {
    
    const [error, setError] = useState<null | string>(null);
    const [loading, setLoading] = useState(false);
    const {t} = useTranslation()

    async function handleDelete(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
       
        setLoading(true)

       
        try {
            if(user !== null){
            await DeleteUserPendingApi(user.id)
            if(ondelete) ondelete()
            onclose()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('delete.error'))
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
                height:'auto',
                width: '300px', 
                display: 'flex',
                flexDirection:'column',
                padding: '2em',
                backgroundColor: 'var(--ivory)',
                borderRadius: '50px',
                color: 'var(--camel)',
                textAlign: 'center',
                gap:'1.5em',
                margin: '0.5em',
                fontFamily: 'SATOSHI-VARIABLE',
                fontSize: '0.8em',
                }}>
            {user && <h1>{t('delete.title')} "{user.username}"?</h1>}
            <div
            style={{
                display:'flex',
                gap:'1.5em',
                justifyContent: 'center'
                }}>
             <Button onClick={handleDelete} variant="contained" color="error" disabled={loading}
             sx={{
                boxShadow:'none',
                color: 'var(--white)',
                fontFamily: 'SATOSHI-VARIABLE',
                textTransform: 'none',
                fontSize: '1.3em',
                borderRadius: '30px',
                '&:hover': {
                    boxShadow:'none',
                    backgroundColor:'var(--dove)'
                }
             }}
             >{loading ? t('common.loading') : t('common.delete')}</Button>
            <Button type="button" variant="outlined" disabled={loading} onClick={onclose}
                sx={{
                boxShadow:'none',
                color: 'var(--camel)',
                border: '1px solid var(--camel)',
                fontFamily: 'SATOSHI-VARIABLE',
                textTransform: 'none',
                fontSize: '1.3em',
                 borderRadius: '30px',
                '&:hover': {
                    boxShadow:'none',
                    backgroundColor:'var(--camel)',
                    color: 'var(--white)'

                }
             }}
            >{loading ? t('common.loading') : t('common.cancel')}</Button>
                </div>
            {error && <p className="error">{error}</p>}

            </div>

        </Modal>
        
    )
}