import escapeStringRegexp from 'escape-string-regexp';
import { Request } from 'express';
import { findSprints } from './sprintService';
import { findTicketsV2, TicketFilter } from './ticketService';

enum Cases {
  searchAll = 'all',
}

export const getAllBacklogTickets = async (req: Request) => {
  const { projectId } = req.params;
  const { title, ticketTypes, ticketEpics, users } = req.query;

  const filter: TicketFilter = { project: projectId };

  if (title) {
    filter.title = title.toString();
  }
  if (ticketTypes) {
    const ticketTypeIds = ticketTypes.toString().split(',');
    filter.type = ticketTypeIds;
  }
  if (ticketEpics) {
    const ticketEpicIds = ticketEpics.toString().split(',');
    filter.epic = ticketEpicIds;
  }
  if (users) {
    const userIds = users.toString().split(',');
    if (userIds.includes('unassigned')) {
      filter.assign = 'unassigned';
    } else {
      filter.assign = userIds;
    }
  }

  return findTicketsV2(filter, req.dbConnection, req.tenantsConnection);
};

export const filterBacklog = async (req: Request) => {
  const { projectId, userCase, typeCase, labelCase } = req.params;
  const { title } = req.query;
  if (!projectId) throw new Error('no project provided');

  const filter: TicketFilter = { project: projectId, sprintId: null };

  if (title) {
    filter.title = title.toString();
  }

  if (userCase !== Cases.searchAll) {
    const userIds = userCase.split('-');
    if (userIds.includes('unassigned')) {
      filter.assign = 'unassigned';
    } else {
      filter.assign = userIds;
    }
  }

  if (typeCase !== Cases.searchAll) {
    const ticketTypeIds = typeCase.split('-');
    filter.type = ticketTypeIds;
  }

  if (labelCase !== Cases.searchAll) {
    const labelIds = labelCase.split('-');
    filter.tags = labelIds;
  }

  const sprints = await findSprints(projectId, false, req.dbConnection);
  const tickets = await findTicketsV2(filter, req.dbConnection, req.tenantsConnection);

  return {
    backlog: {
      cards: tickets,
    },
    sprints: sprints,
  };
};

export const getBacklogTickets = async (req: Request) => {
  const { projectId } = req.params;
  const { query } = req.query;

  if (!projectId) throw new Error('no project provided');
  if (!query) throw new Error('No Query Found');

  const escapeRegex = escapeStringRegexp(query.toString());
  const filter: TicketFilter = {
    project: projectId,
    title: escapeRegex,
  };

  return findTicketsV2(filter, req.dbConnection, req.tenantsConnection);
};
