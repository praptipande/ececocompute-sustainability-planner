import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import authRouter from './routes/auth.routes.js';
import healthRouter from './routes/health.routes.js';
import scenarioRouter from './routes/scenario.routes.js';
import comparisonRouter from './routes/comparison.routes.js';
import optimizationRouter from './routes/optimization.routes.js';
import recommendationRouter from './routes/recommendation.routes.js';
import adminRouter from './routes/admin.routes.js';

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/scenarios', scenarioRouter);
app.use('/api/comparisons', comparisonRouter);
app.use('/api/optimize', optimizationRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/admin', adminRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
