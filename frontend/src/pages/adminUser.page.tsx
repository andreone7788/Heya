import { useEffect, useState } from "react"
import { TypeCreateUserSchema, TypeUserSchema } from "../types/user.types";
import { CreateUserApi, UserListApi} from "../api/admin/management.api";
import { DataGrid, type GridColDef, type GridRowsProp } from '@mui/x-data-grid';
import { Box, Button } from "@mui/material";
import { CreateUser } from "../components/createModal";
import { DeleteUserModal } from "../components/deleteModal";
import { useTranslation } from "react-i18next";

export const ManagementUser = () => {
    const [user, setUser] = useState<TypeUserSchema[]>([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<null | string>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedDeleteUser, setSelectedDeleteUser] = useState<TypeUserSchema | null>(null);
    const handleDeleteOpen = () => setIsDeleteOpen(true)
    const {t} = useTranslation()


    async function LoadUsers() {
        setLoading(true)
        try {
            const data = await UserListApi()
            const activeUsers = data.filter(u => u.status === 'ACTIVE')
            setUser(activeUsers)
            setError(null)

        } catch (err) {
            setError(err instanceof Error ? err.message : t('admin.error.loading'))
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (payload: TypeCreateUserSchema) => {
        setError(null)
        setLoading(true)
        try {
            await CreateUserApi(payload)
            await LoadUsers()
            setIsCreateOpen(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : t('admin.error.create'))
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        LoadUsers()
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
                        color='error'
                        onClick={() => {
                            setSelectedDeleteUser(user.find(u => u.userId === params.row.id) || null)
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
        }
    ]

    const rows: GridRowsProp = user.map(u => ({
        id: u.userId,
        name: u.name,
        surname: u.surname,
        username: u.username,
        email: u.email,
        status: u.status,
        phone: u.phone
    }))

    return (
        <div id='userTable'
        style={{fontFamily:'SATOSHI-VARIABLE', display:'flex', flexDirection:'column', minHeight:'100vh', justifyContent:'center', alignItems:'center', padding:'6em 1em', gap:'1em', paddingTop: '5em', boxSizing:'border-box'}}>
            <h1 style={{marginTop: '1.7em'}}>{t('admin.table.title')}</h1>
            <Button
                variant="contained"
                onClick={() => setIsCreateOpen(true)}
                sx={{
                            backgroundColor: 'var(--camel)',
                            color: 'var(--white)',
                            borderRadius: '50px',
                            fontSize: '1em',
                            boxShadow: 'none',
                            textTransform: 'none',
                            fontFamily: 'SATOSHI-VARIABLE',
                            '&:hover': {
                                backgroundColor: 'var(--brown)',
                                color: 'var(--white)',
                                boxShadow: 'none',
                            }
                        }}
            >
                {t('admin.table.create')}
            </Button>

            {error && <p className="error">{error}</p>}


            <Box sx={{ 
                height: 400,
                maxWidth:'60vw', 
                width:'100%',
                fontFamily: 'SATOSHI-VARIABLE',
                '& .MuiTablePagination-selectLabel, .MuiInputBase-root, .MuiTablePagination-displayedRows':{
                    fontFamily: 'SATOSHI-VARIABLE',
                }, '@media (max-width: 870px)': {

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
  
            {isCreateOpen && (
                <CreateUser
                    onsubmit={handleCreate}
                    onclose={() => setIsCreateOpen(false)}
                    onopen={isCreateOpen}
                />
            )}

            {isDeleteOpen && (
                <DeleteUserModal
                    user = {selectedDeleteUser}
                    onclose={() => {setIsDeleteOpen(false); setSelectedDeleteUser(null)}}
                    onopen={isDeleteOpen}
                    ondelete={LoadUsers}
                />
            )}

        </div>
    )

}