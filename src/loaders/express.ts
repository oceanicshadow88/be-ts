import express, { NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import config from '../app/config/app';

const apiRouterV2 = require('../app/routes/v2/api');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./errorHandler');
import status from 'http-status';
import { globalAsyncErrorHandler } from './routes';
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
  app.use((err: Error, req: express.Request, res: express.Response, next: NextFunction) => {
    errorHandler.handleError(err, res);
    //eslint-disable-next-line no-console
    console.log('errorHandler');
    res.status(status.INTERNAL_SERVER_ERROR).send();
    next();
  });

  return app;
};
