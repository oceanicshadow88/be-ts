import escapeStringRegexp from 'escape-string-regexp';
import { Request } from 'express';

export const buildSearchTicketQuery = (req: Request) => {
  const { title, taskTypes, users } = req.query;
  let filter: any = {};
  if (title) {
    const escapeRegex = escapeStringRegexp(title.toString());
    const regex = new RegExp(escapeRegex, 'i');
    filter.title = regex;
  }
  if (taskTypes) {
    const taskTypeIds = taskTypes.toString().split(',');
    filter.type = { $in: taskTypeIds };
  }
  if (users) {
    const userIds = users.toString().split(',');
    filter = {
      ...filter,
      ...{
        $or: [
          { assign: { $in: userIds.filter((id) => id !== 'unassigned') } }, // Include filtered IDs
          ...(userIds.includes('unassigned') ? [{ assign: null }] : []), // Add `null` condition if 'unassigned' is present
        ],
      },
    };
  }
  return filter;
};
