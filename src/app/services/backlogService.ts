import escapeStringRegexp from 'escape-string-regexp';
import { Request } from 'express';
import { findSprints } from './sprintService';
import { findTickets } from './ticketService';

interface IBaseFilter {
  project: string;
  sprintId?: null;
}

interface IFuzzySearchFilter extends IBaseFilter {
  title?: RegExp;
}

interface ITypeFilter extends IBaseFilter {
  type?: { $in: string[] };
}

interface IEpicFilter extends IBaseFilter {
  epic?: { $in: string[] };
}

interface IBacklogUserFilter extends IBaseFilter {
  assign?: { $in: string[] };
}

interface IAllBacklogUserFilter extends IBaseFilter {
  $or?: Array<{
    assign: { $in: string[] } | null;
  }>;
}

interface ILabelFilter extends IBaseFilter {
  tags?: { $all: string[] };
}

export const getAllBacklogTickets = async (req: Request) => {
  const { projectId } = req.params;
  const { title, ticketTypes, ticketEpics, users } = req.query;

  let fuzzySearchFilter: IFuzzySearchFilter = { project: projectId };
  let typeFilter: ITypeFilter = { project: projectId };
  let userFilter: IAllBacklogUserFilter = { project: projectId };
  let epicFilter: IEpicFilter = { project: projectId };
  if (title) {
    const escapeRegex = escapeStringRegexp(title.toString());
    const regex = new RegExp(escapeRegex, 'i');
    fuzzySearchFilter = { title: regex, project: projectId };
  }
  if (ticketTypes) {
    const ticketTypeIds = ticketTypes.toString().split(',');
    typeFilter = { type: { $in: ticketTypeIds }, project: projectId };
  }
  if (ticketEpics) {
    const ticketEpicIds = ticketEpics.toString().split(',');
    epicFilter = { epic: { $in: ticketEpicIds }, project: projectId };
  }
  if (users) {
    const userIds = users.toString().split(',');
    userFilter = {
      $or: [
        { assign: { $in: userIds.filter((id) => id !== 'unassigned') } }, // Include filtered IDs
        ...(userIds.includes('unassigned') ? [{ assign: null }] : []), // Add `null` condition if 'unassigned' is present
      ],
      project: projectId,
    };
  }
  // Backlog tickets are ticket whose sprintId is null
  // Sprint tickets are ticket whose sprintId is not null
  const allTickets = await findTickets(
    fuzzySearchFilter,
    userFilter,
    typeFilter,
    epicFilter,
    {},
    req.dbConnection,
    req.tenantsConnection,
  );
  return allTickets;
};

export const filterBacklog = async (req: Request) => {
  const { projectId, userCase, typeCase, labelCase } = req.params;
  const { title } = req.query;
  if (!projectId) throw new Error('no project provided');

  let fuzzySearchFilter: IFuzzySearchFilter = { project: projectId };
  let userFilter: IBacklogUserFilter;
  let typeFilter: ITypeFilter;
  let labelFilter: ILabelFilter;

  enum Cases {
    searchAll = 'all',
  }

  if (title) {
    const escapeRegex = escapeStringRegexp(title.toString());
    const regex = new RegExp(escapeRegex, 'i');
    fuzzySearchFilter = { title: regex, project: projectId };
  }
  if (userCase === Cases.searchAll) {
    userFilter = { project: projectId };
  } else {
    const userIds = userCase.split('-');
    userFilter = {
      assign: { $in: userIds },
      project: projectId,
    };
  }

  if (typeCase === Cases.searchAll) {
    typeFilter = { project: projectId };
  } else {
    const ticketTypeIds = typeCase.split('-');
    typeFilter = { type: { $in: ticketTypeIds }, project: projectId };
  }

  if (labelCase === Cases.searchAll) {
    labelFilter = { project: projectId };
  } else {
    const labelIds = labelCase.split('-');
    labelFilter = { tags: { $all: labelIds }, project: projectId };
  }
  const sprints = await findSprints(projectId, false, req.dbConnection);
  const tickets = await findTickets(
    { ...fuzzySearchFilter, sprintId: null },
    { ...userFilter, sprintId: null },
    { ...typeFilter, sprintId: null },
    {},
    { ...labelFilter, sprintId: null },
    req.dbConnection,
    req.tenantsConnection,
  );

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

  // escape unsafe regex
  const escapeRegex = escapeStringRegexp(query.toString());

  const regex = new RegExp(escapeRegex);
  const fuzzySearchFilter = { title: regex, project: projectId };
  return findTickets(fuzzySearchFilter, {}, {}, {}, {}, req.dbConnection, req.tenantsConnection);
};
