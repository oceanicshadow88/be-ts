import { Request, Response, NextFunction, Router } from 'express';
import { winstonLogger } from '../../loaders/logger';

import * as path from 'path'; // Import the 'path' module
import { asyncHandler } from '../../app/utils/helper';

// Helper function to extract the source file from the stack trace
function extractRelevantSourceFile(stack?: string): string | undefined {
  if (!stack) {
    return undefined;
  }

  const lines = stack.split('\n');
  // Iterate over stack lines (skip the first line, which is the error message)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Regex to find a file path:
    // Looks for patterns like "... (/path/to/file.ext:line:col)" or "... /path/to/file.ext:line:col"
    const match = line.match(/\s*(?:at .*?\(([^:]+):\d+:\d+\)|at ([^:]+):\d+:\d+)/);

    let filePath: string | undefined;
    if (match) {
      // match[1] is path in parentheses, match[2] is path without parentheses
      filePath = match[1] || match[2];
    }

    if (filePath) {
      filePath = filePath.trim();
      // Consider it a relevant user file if it's not from node_modules and is a .ts or .js file
      if (!filePath.includes('node_modules') && (filePath.endsWith('.ts') || filePath.endsWith('.js'))) {
        return path.basename(filePath); // Return the basename of the first relevant file found
      }
    }
  }
  return undefined; // No suitable file found
}

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log('--------------------------------');
  console.log('GLOBAL ERROR HANDLER ENTERED for:', req.originalUrl); 
  console.log('--------------------------------');

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An internal server error occurred';

  const originatingFile = extractRelevantSourceFile(err.stack);

  // Log the error with detailed context
  const logContext: any = {
    error: err, // Pass the original error object for stack trace and other properties
    message,
    errorType: err.name || (err.constructor?.name !== 'Object' ? err.constructor?.name : 'GenericError'), // Get error type/name
    apiRoute: req.originalUrl,
    httpMethod: req.method,
    sourceFile: originatingFile, // Use the dynamically determined source file
    validationErrors: err.validationErrors,
    context: err.context || { requestBody: req.body, requestParams: req.params, requestQuery: req.query } 
  }

  winstonLogger.error({ message: err.message, stack: err.stack, ...logContext });
  res.status(statusCode).send(message);

  // res.status(statusCode).json({
  //   success: false,
  //   error: {
  //     message,
  //     type: err.name || 'Error',
  //     sourceFile: originatingFile,
  //     validationErrors: err.validationErrors || undefined,
  //   },
  // });

};


export const autoWrapRouter = (router: Router): Router => {
  const newRouter = Router();
  
  // Copy all routes and wrap them with asyncHandler
  router.stack.forEach((layer: any) => {
    if (layer.route) {
      const { path, stack, methods } = layer.route;
      Object.keys(methods).forEach((method) => {
        const handlers = stack.map((h: any) => asyncHandler(h.handle || h));
        (newRouter as any)[method](path, ...handlers);
      });
    } else if (layer.handle) {
      // This handles middleware layers
      newRouter.use(layer.regexp, layer.handle);
    }
  });
  
  return newRouter;
};