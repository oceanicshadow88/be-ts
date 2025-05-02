import escapeStringRegexp from 'escape-string-regexp';
import { Request } from 'express';
import { findTickets } from './ticketService';

class BacklogFilterBuilder {
  private readonly filters: Record<string, any>;

  constructor(projectId: string) {
    this.filters = {};
    this.filters.project = projectId;
  }

  withTitle(title: any) {
    const escapeRegex: string = escapeStringRegexp(title);
    const regex: RegExp = new RegExp(escapeRegex, 'i');
    this.filters.title = regex;
    return this;
  }

  withType(ticketTypes: any) {
    const ticketTypeIds = ticketTypes.split(',');
    this.filters.type = { $in: ticketTypeIds };
    return this;
  }

  withEpic(ticketEpics: any) {
    const ticketEpicIds = ticketEpics.split(',');
    this.filters.epic = { $in: ticketEpicIds };
    return this;
  }

  withUsers(users: any) {
    const userIds = users.split(',');
    this.filters.$or = [
      { assign: { $in: userIds.filter((id: string) => id !== 'unassigned') } },
      ...(userIds.includes('unassigned') ? [{ assign: null }] : []),
    ];
    return this;
  }

  withLabels(labels: any) {
    const labelIds = labels.split(',');
    this.filters.tags = { $all: labelIds };
    return this;
  }

  withSprint(sprintId: any) {
    this.filters.sprint = sprintId;
    return this;
  }

  build() {
    return {
      ...this.filters,
    };
  } 
}

export const fetchBacklogTickets = async (req: Request) => {
  const { projectId } = req.params;
  const { title, ticketTypes, ticketEpics, users, labels } = req.query;

  const filters = new BacklogFilterBuilder(projectId);

  if (title) {
    filters.withTitle(title);
  }
  if (ticketTypes) {
    filters.withType(ticketTypes);
  }
  if (ticketEpics) {
    filters.withEpic(ticketEpics);
  }
  if (users) {
    filters.withUsers(users);
  }
  if (labels) {
    filters.withLabels(labels);
  }

  // filters.withSprint(null); 
  //逻辑是否有误？ 前端现在显示了有sprint的ticket

  // Backlog tickets are ticket whose sprintId is null
  // Sprint tickets are ticket whose sprintId is not null
  const allTickets = await findTickets(
    req.dbConnection,
    req.tenantsConnection,
    filters.build(),
  );
  return allTickets;
};

// export const filterBacklog = async (req: Request) => {
//   const { projectId, userCase, typeCase, labelCase } = req.params;
//   const { title } = req.query;
//   if (!projectId) throw new Error('no project provided');

//   let fuzzySearchFilter: IFuzzySearchFilter = { project: projectId };
//   let userFilter: IBacklogUserFilter;
//   let typeFilter: ITypeFilter;
//   let labelFilter: ILabelFilter;

//   enum Cases {
//     searchAll = 'all',
//   }

//   if (title) {
//     const escapeRegex = escapeStringRegexp(title.toString());
//     const regex = new RegExp(escapeRegex, 'i');
//     fuzzySearchFilter = { title: regex, project: projectId };
//   }
//   if (userCase === Cases.searchAll) {
//     userFilter = { project: projectId };
//   } else {
//     const userIds = userCase.split('-');
//     userFilter = {
//       assign: { $in: userIds },
//       project: projectId,
//     };
//   }

//   if (typeCase === Cases.searchAll) {
//     typeFilter = { project: projectId };
//   } else {
//     const ticketTypeIds = typeCase.split('-');
//     typeFilter = { type: { $in: ticketTypeIds }, project: projectId };
//   }

//   if (labelCase === Cases.searchAll) {
//     labelFilter = { project: projectId };
//   } else {
//     const labelIds = labelCase.split('-');
//     labelFilter = { tags: { $all: labelIds }, project: projectId };
//   }
//   const sprints = await findSprints(projectId, false, req.dbConnection);
//   const tickets = await findTickets(
//     req.dbConnection,
//     req.tenantsConnection,
//     { ...fuzzySearchFilter, sprintId: null },
//     { ...userFilter, sprintId: null },
//     { ...typeFilter, sprintId: null },
//     { ...labelFilter, sprintId: null },
//   );

//   return {
//     backlog: {
//       cards: tickets,
//     },
//     sprints: sprints,
//   };
// };

// export const getBacklogTickets = async (req: Request) => {
//   const { projectId } = req.params;
//   const { query } = req.query;

//   if (!projectId) throw new Error('no project provided');
//   if (!query) throw new Error('No Query Found');

//   // escape unsafe regex
//   const escapeRegex = escapeStringRegexp(query.toString());

//   const regex = new RegExp(escapeRegex);
//   const fuzzySearchFilter = { title: regex, project: projectId };
//   return findTickets(
//     req.dbConnection, 
//     req.tenantsConnection,
//     fuzzySearchFilter,
//   );
// };
