const errorNameToStatus: { [key: string]: number } = {
  'ValidationError': 422,
  'CastError': 400,
  'UnauthorizedError': 401,
  'ForbiddenError': 403,
  'NotFoundError': 404,
  'SyntaxError': 400,
  'Error': 500,
};

export const getStatusCode = (err: unknown): number => {
  if (typeof err === 'object' && err !== null) {
    const e = err as { name?: string; statusCode?: number; status?: number };
    return e.statusCode || e.status || errorNameToStatus[e.name ?? 'Error'] || 501;
  }
  return 501;
};