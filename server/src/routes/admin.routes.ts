import { Router } from 'express';
import { dashboard, datasets, users } from '../controllers/admin.controller.js';
import { requireAuthentication } from '../middleware/auth.middleware.js';
import { requireRoles } from '../middleware/role.middleware.js';

const adminRouter = Router();
adminRouter.use(requireAuthentication, requireRoles('admin'));
adminRouter.get('/dashboard', dashboard);
adminRouter.get('/users', users);
adminRouter.get('/datasets', datasets);

export default adminRouter;
