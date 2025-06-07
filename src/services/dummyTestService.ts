export function simulateServiceError(): void {
    throw new Error('This error originated from the dummyTestService.ts file!');
  }
  
  export function simulateServiceErrorWithContext(): void {
    const serviceError = new Error('Service error with specific context.');
    (serviceError as any).context = { serviceOperation: 'criticalCalculation', detail: 'divisor was zero' };
    (serviceError as any).statusCode = 409; // Conflict
    throw serviceError;
  }
  
  export function simulateValidationErrorInService(): void {
    const validationError = new Error('Simulated validation error from service.');
    (validationError as any).validationErrors = {
      fieldInService: 'This field failed validation within the service layer.',
      anotherField: 'Requires a numeric value.',
    };
    (validationError as any).statusCode = 400; // Bad Request
    (validationError as any).name = 'ServiceValidationError'; // Custom error name
    throw validationError;
  } 