//FEDERICA

import { Router } from 'express';
import {
    getConversationMessagesController,
    getUserConversationsController,
    markAsReadController,
    getOrCreateConversationByEmailsController,
    markConversationAsReadController, // ✅ Aggiungi
    getUnreadCountsController
} from '../controllers/conversation.controller';
import { authLogin } from '../middleware/auth';

export const conversationRouter = (expressRouter: Router) => {
    const router = Router();

    router.use(authLogin);

    router.get('/', getUserConversationsController);
    router.get('/between/:email1/:email2', getOrCreateConversationByEmailsController); // ← NUOVA!
    router.get('/:conversationId/messages', getConversationMessagesController);
    router.put('/messages/:messageId/read', markAsReadController);
    router.get('/unread', getUnreadCountsController);
    router.put('/:conversationId/mark-read', markConversationAsReadController);

    expressRouter.use('/conversations', router);
}