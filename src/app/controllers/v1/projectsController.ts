//2. no services

import { Request, Response } from 'express';
import { replaceId } from '../../services/replaceService';
import status from 'http-status';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/helper';
import {
  deleteProject,
  getAllProjects,
  initProject,
  showProject,
  updateProject,
  projectDetails,
} from '../../services/projectService';
import * as Ticket from '../../model/ticket';
import * as Type from '../../model/type';

//get
const index = asyncHandler(async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await getAllProjects(req);
  res.status(200).send(replaceId(result));
});

//get one
const show = asyncHandler(async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await showProject(req);
  res.status(200).send(replaceId(result));
});

//POST
const store = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const { body, dbConnection, tenantId } = req;
  const userId = req.body.userId;
  const project = await initProject(body, userId, dbConnection, tenantId || userId);
  res.status(status.CREATED).send(replaceId(project));
});

// put
const update = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await updateProject(req);
  return res.send(replaceId(result));
});

//delete
const deleteOne = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  deleteProject(req);
  res.status(status.OK).json({});
});

const details = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }

  const result = await projectDetails(req);
  res.status(status.OK).json(replaceId(result));
});

const tempImport = asyncHandler(async (req: Request, res: Response) => {
  const ticketData = [
    'Combine to filter function in filterBacklog and Board',
    'Refactor the findTickets function(Backend)',
    'Remove any apiV1 unused endpoint',
    'Add authenticationTokenMiddleware to any endpoints that needed',
    'replaceService should be Utis',
    'Go via each service and see are there any functions can be move to model (EPIC)',
    'Fix any type (EPIC)',
    '(CreateEditSprint) rename, delete btn ????',
    'Add new status for board',
    'Check component using the same name as file name (EPIC)',
    'Move all Modals under components Modal folder (EPIC)',
    'Check shortcut function',
    'Find a better way to handle error in the backend so dont need to add async handler',
    'Change all the use import instead of require in the be',
    'Find a better way to handle req.dbConnection and req.tenantsConnection and getModel function',
  ];

  try {
    const typeModel = await Type.getModel(req.dbConnection);
    const types = await typeModel.find({});
    const updatedData = ticketData.map((item: any) => {
      return {
        updateOne: {
          filter: { title: item.title }, // Search by title
          update: {
            $set: {
              title: item.title,
              priority: 'Medium',
              project: req.params.projectId,
              reporter: null,
              type: types.find((resData: any) => resData.slug === 'techDebt')?.id,
            },
          },
          upsert: true, // This will insert if no document matches the filter
        },
      };
    });
    const ticketModel = await Ticket.getModel(req.dbConnection);
    ticketModel.bulkWrite(updatedData);
    res.status(status.OK).json();
  } catch (e) {}
});

export { index, show, store, update, deleteOne, details, tempImport };
