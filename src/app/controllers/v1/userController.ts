import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';
import * as User from '../../model/user';
import { BadRequestError } from '../../error/badRequest.error';
import { NotFoundError } from '../../error/notFound.error';
import { ValidationError } from '../../error/validation.error';
import { asyncHandler } from '../../utils/helper';

export const index = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, user } = req;
  const userModel = await User.getModel(req.tenantsConnection);
  const users = await userModel.find({ active: true, tenants: tenantId });
  if (users.length === 0) {
    res.send(replaceId(user));
  }
  res.send(replaceId(users));
});

export const show = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid request parameters', {
      errors: errors.array(),
    });
  }

  const { id } = req.params;
  if (!id) {
    throw new BadRequestError('User ID is required');
  }

  const userModel = await User.getModel(req.tenantsConnection);
  const user = await userModel.findById(id);

  if (!user) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  return res.send(user);
});
