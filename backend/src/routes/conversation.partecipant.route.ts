//FEDERICA

import { Router } from 'express';
import { getAllUsersController, getUserForChatController, getUserByEmailController } from '../controllers/conversation.partecipant.controller';
import { authLogin } from '../middleware/auth';

export const conversationPartecipantRouter = (expressRouter: Router) => {
    const router = Router();
    
    router.use(authLogin);
    
    router.get('/', getAllUsersController);
    router.get('/by-email/:email', getUserByEmailController);
    router.get('/:userId', getUserForChatController);

    expressRouter.use('/contacts', router);
}