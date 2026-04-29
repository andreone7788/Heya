import { managementRouter } from "./admin/management.routes";
import { conversationPartecipantRouter } from "./conversation.partecipant.route";
import { conversationRouter } from "./conversation.route";
import { userRouter } from "./user.route";
import express, { Express } from "express";


export const router = (app: Express): void => {
    const router = express.Router()
    userRouter(router)
    managementRouter(router)
    conversationRouter(router)
    conversationPartecipantRouter(router)

    app.use('/heya', router);
}