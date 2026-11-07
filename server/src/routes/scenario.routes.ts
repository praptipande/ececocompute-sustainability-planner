import { Router } from 'express';
import {
  create,
  get,
  list,
  remove,
  update,
} from '../controllers/scenario.controller.js';
import { requireAuthentication } from '../middleware/auth.middleware.js';

const scenarioRouter = Router();
scenarioRouter.use(requireAuthentication);
scenarioRouter.post('/', create);
scenarioRouter.get('/', list);
scenarioRouter.get('/:id', get);
scenarioRouter.patch('/:id', update);
scenarioRouter.delete('/:id', remove);

export default scenarioRouter;
