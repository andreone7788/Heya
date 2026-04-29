import { Router } from 'express';
import { LoginController, CheckAuthController, RegisterController, UpdatePasswordController, LogoutController, UploadAvatarController, UpdateUserProfileController } from '../controllers/user.controller';
import { authLogin, } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';

export const userRouter = (expressRouter: Router) => {
    const router = Router();

    router.get('/session', authLogin, CheckAuthController)
    router.post('/logout', authLogin, LogoutController)
    router.post('/login', LoginController)
    router.post('/register', RegisterController)
    router.post('/upload-avatar', authLogin, uploadAvatar, UploadAvatarController)
    router.put('/update', authLogin, UpdatePasswordController)
    router.put('/update-profile', authLogin, UpdateUserProfileController)

    expressRouter.use('/user', router);
}