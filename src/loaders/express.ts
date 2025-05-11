import express from 'express';
import rateLimit from 'express-rate-limit';
import config from '../app/config/app';

const apiRouterV2 = require('../app/routes/v2/api');
const cors = require('cors');
const helmet = require('helmet');
import { errorHandler, notFoundHandler } from '../app/middleware/errorHandler';
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
  app.use(cors());
  app.use(express.json());
  if (process.env.LIMITER?.toString() === true.toString()) {
    app.use(limiter);
  }
  app.use(helmet());
  app.use(`${config.api.prefix}/v2`, globalAsyncErrorHandler(apiRouterV2));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
