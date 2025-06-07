import express, { NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import config from '../app/config/app';

import testRoutes from '../routes/test.routes';

const apiRouterV2 = require('../app/routes/v2/api');
const cors = require('cors');
const helmet = require('helmet');

import { autoWrapRouter, globalErrorHandler } from './routes';

const compression = require('compression');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = () => {
  const app = express();

  app.use(compression());
  app.use(cors({
    exposedHeaders: ['Content-Disposition'], 
  }));
  app.use(express.json());
  if (process.env.LIMITER?.toString() === true.toString()) {
    app.use(limiter);
  }
  app.use(helmet());

  app.use(`${config.api.prefix}/v2/logger`, autoWrapRouter(testRoutes));
  app.use(`${config.api.prefix}/v2`, autoWrapRouter(apiRouterV2));

  app.use(globalErrorHandler);

  return app;
};
