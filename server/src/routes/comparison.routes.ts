import { Router } from 'express';
import { createComparison } from '../controllers/comparison.controller.js';
import { requireAuthentication } from '../middleware/auth.middleware.js';

const comparisonRouter = Router();
comparisonRouter.use(requireAuthentication);
comparisonRouter.post('/', createComparison);

export default comparisonRouter;
