import { UserListController, CreateUserController, DeleteUserController, ApproveUserController, UserListPendingController, DeleteUserPendingController} from "../../controllers/admin/management.controller";
import { authAdmin } from "../../middleware/auth";
import { Router } from "express";

export const managementRouter = (expressRouter: Router) => {
    const router = Router()
    router.use(authAdmin)
    router.get('/load', UserListController)
    router.get('/load/pending', UserListPendingController)
    router.post('/create', CreateUserController)
    router.put('/approve/:requestId', ApproveUserController)
    router.delete('/delete/:userId', DeleteUserController)
    
    router.delete('/delete/pending/:id', DeleteUserPendingController)
    expressRouter.use('/management', router)
}