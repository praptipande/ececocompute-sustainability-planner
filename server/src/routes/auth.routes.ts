import { Router } from 'express';
import { getCurrentUser, login, register } from '../controllers/auth.controller.js';
import { requireAuthentication } from '../middleware/auth.middleware.js';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', requireAuthentication, getCurrentUser);

export default authRouter;
