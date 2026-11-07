import { Router } from 'express';
import { optimize } from '../controllers/optimization.controller.js';
import { requireAuthentication } from '../middleware/auth.middleware.js';

const optimizationRouter = Router();
optimizationRouter.use(requireAuthentication);
optimizationRouter.post('/', optimize);

export default optimizationRouter;
