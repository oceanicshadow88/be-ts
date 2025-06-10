import express, { NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import config from '../app/config/app';

const { errorHandler } = require('./errorHandlers/errorHandlerMiddleware');
const { globalAsyncErrorHandler } = require('./errorHandlers/asyncMiddleware');
const apiRouterV2 = require('../app/routes/v2/api');
const cors = require('cors');
const helmet = require('helmet');
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
  app.use(`${config.api.prefix}/v2`, globalAsyncErrorHandler(apiRouterV2));
  app.use((err: Error, req: express.Request, res: express.Response) => {
    errorHandler.handleError(err, req, res);
  });

  return app;
};
