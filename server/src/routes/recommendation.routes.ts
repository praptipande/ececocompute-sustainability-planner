import { Router } from 'express';
import { recommend } from '../controllers/recommendation.controller.js';
import { requireAuthentication } from '../middleware/auth.middleware.js';

const recommendationRouter = Router();
recommendationRouter.use(requireAuthentication);
recommendationRouter.post('/', recommend);

export default recommendationRouter;
