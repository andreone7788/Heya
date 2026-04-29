import { useEffect, useState } from "react"
import { TypePendingSchema } from "../types/user.types";
import { UserListPendingApi } from "../api/admin/management.api";
import { DataGrid, type GridColDef, type GridRowsProp } from '@mui/x-data-grid';
import { Box, Button } from "@mui/material";
import { ApproveUserModal } from "../components/approveUserModal";
import { useTranslation } from "react-i18next";
import { DeleteUserPendingModal } from "../components/deleteModal copy";

export const ManagementUserPending = () => {
    const [user, setUser] = useState<TypePendingSchema[]>([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<null | string>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isApproveOpen, setIsApproveOpen] = useState(false)
    const [selectedDeleteUser, setSelectedDeleteUser] = useState<TypePendingSchema | null>(null);
    const [selectedApproveUser, setSelectedApproveUser] = useState<TypePendingSchema | null>(null);
    const handleDeleteOpen = () => setIsDeleteOpen(true)
    const handleApproveOpen = () => setIsApproveOpen(true)
    const { t } = useTranslation()


    async function LoadPendingUsers() {
        setLoading(true)
        try {
            const data = await UserListPendingApi()
            // Filtra solo utenti pending
            const pendingUsers = data.filter(u => u.status === 'PENDING')

            setUser(pendingUsers)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : t('admin.error.loading'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        LoadPendingUsers()
    }, [])

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'Id' },
        { field: 'name', headerName: t('common.name') },
        { field: 'surname', headerName: t('common.surname') },
        { field: 'username', headerName: t('common.username') },
        { field: 'email', headerName: t('common.email') },
        { field: 'status', headerName: t('common.status') },
        { field: 'phone', headerName: t('common.phone') },
        {
            field: 'delete',
            headerName: t('common.delete'),
            renderCell: (params) => (
                
                    <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => {
                            setSelectedDeleteUser(user.find(u => u.id === params.row.id) || null)
                            console.log(params.row.id)
                            handleDeleteOpen()
                        }}
                         sx={{
                                boxShadow: 'none',
                                border: '1px solid',
                                fontFamily: 'SATOSHI-VARIABLE',
                                textTransform: 'none',
                                fontSize: '1.1em',
                                borderRadius: '30px',
                                maxWidth: '100vw',
                                width: '100%',
                                '&:hover, :active': {
                                    boxShadow: 'none',
                                    backgroundColor: '#d32f2f',
                                    color:'var(--white)'

                                }
                            }}
                    >{t('common.delete')}
                    </Button>

                
            )
        },

        {
            field: 'approve',
            headerName: t('common.approve'),
            renderCell: (params) => (
                params.row.status === 'PENDING' ? (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                            setSelectedApproveUser(user.find(u => u.id === params.row.id) || null)
                            handleApproveOpen()
                        }}

                         sx={{
                                boxShadow: 'none',
                                border: '1px solid var(--camel)',
                                color:'var(--camel)',
                                fontFamily: 'SATOSHI-VARIABLE',
                                textTransform: 'none',
                                fontSize: '1.1em',
                                borderRadius: '30px',
                                maxWidth: '100vw',
                                width: '100%',
                                '&:hover, :active': {
                                    boxShadow: 'none',
                                    backgroundColor: 'var(--camel)',
                                    color:'var(--white)'

                                }
                            }}
                    >
                        {t('common.approve')}
                    </Button>
                ) : null
            )
        }
    ]


    const rows: GridRowsProp = user.map(u => ({
        id: u.id,
        name: u.name,
        surname: u.surname,
        username: u.username,
        email: u.email,
        status: u.status,
        phone: u.phone
    }))

    return (
        <div id='userTable' style={{fontFamily:'SATOSHI-VARIABLE', display:'flex', flexDirection:'column', minHeight:'100vh', justifyContent:'center', alignItems:'center', padding:'0 1em', gap:'1em', paddingTop: '5em', boxSizing:'border-box'}}>
            <h1>{t('admin.pendingTable.title')}</h1>

            {error && <p className="error">{error}</p>}


            <Box sx={{ 
                height: 400,
                maxWidth:'60vw', 
                width: '100%',
                fontFamily: 'SATOSHI-VARIABLE',
                '& .MuiTablePagination-selectLabel, .MuiInputBase-root, .MuiTablePagination-displayedRows': {
                    fontFamily: 'SATOSHI-VARIABLE',
                },
                '@media (max-width: 870px)': {

                    maxWidth: '100vw',
                    boxSizing: 'border-box'
                },
            }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } }
                    }}
                    disableRowSelectionOnClick

                    sx={{
                        fontFamily: 'SATOSHI-VARIABLE',
                        borderRadius: '20px',
                    }}

                   
                />
            </Box>
            {isDeleteOpen && (
                <DeleteUserPendingModal
                    user={selectedDeleteUser}
                    onclose={() => { setIsDeleteOpen(false); setSelectedDeleteUser(null) }}
                    onopen={isDeleteOpen}
                    ondelete={LoadPendingUsers}
                />
            )}
            {isApproveOpen && (
                <ApproveUserModal
                    user={selectedApproveUser}
                    onclose={() => { setIsApproveOpen(false); setSelectedApproveUser(null) }}
                    onopen={isApproveOpen}
                    onapprove={LoadPendingUsers}
                />
            )}
        </div>
    )

}