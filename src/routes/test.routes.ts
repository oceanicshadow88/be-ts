import express, { Request, Response, NextFunction } from 'express';
import {
  simulateServiceError,
  simulateServiceErrorWithContext,
  simulateValidationErrorInService
} from '../services/dummyTestService'; // Adjust path as needed

import { asyncHandler } from '../app/utils/helper'; // Make sure path is correct


const router = express.Router();

router.get('/error/:type', async (req: Request, res: Response, next: NextFunction) => {
// router.get('/error/:type', async (req: Request, res: Response, next: NextFunction) => {

  const errorType = req.params.type;


  switch (errorType) {
    case 'basic':
      throw new Error('This is a basic simulated error from the test route.');

    case 'statuscode':
      const errWithStatus = new Error('Simulated error with custom status code 403 from route.');
      (errWithStatus as any).statusCode = 403;
      throw errWithStatus;

    case 'validation_route':
      const validationError = new Error('Simulated validation error from route.');
      (validationError as any).validationErrors = {
        username_route: 'Route: Username must be at least 5 characters.',
        email_route: 'Route: Email is not in a valid format.',
      };
      (validationError as any).statusCode = 400;
      (validationError as any).name = 'RouteValidationError';
      throw validationError;
    
    case 'customcontext_on_error':
      const customContextError = new Error('Simulated error with custom context on error object from route.');
      (customContextError as any).context = {
        transactionId_route: 'txn_route_123abc',
        additionalInfo_route: 'Route-specific error detail',
      };
      (customContextError as any).statusCode = 422; // Unprocessable Entity
      throw customContextError;

    case 'service_basic':
      simulateServiceError();
      break;

    case 'service_context':
      simulateServiceErrorWithContext();
      break;

    case 'service_validation':
      simulateValidationErrorInService();
      break;
      
    default:
      const notFoundError = new Error(`Unknown error type: ${errorType}. Supported types: basic, statuscode, validation_route, customcontext_on_error, service_basic, service_context, service_validation`);
      (notFoundError as any).statusCode = 404;
      throw notFoundError;
    }
  
});

export default router; 