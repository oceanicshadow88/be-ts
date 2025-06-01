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
    if (!title) return this;
    const escapeRegex: string = escapeStringRegexp(title);
    const regex: RegExp = new RegExp(escapeRegex, 'i');
    this.filters.title = regex;
    return this;
  }

  withType(ticketTypes: any) {
    if (!ticketTypes) return this;
    const ticketTypeIds = ticketTypes.split(',');
    this.filters.type = { $in: ticketTypeIds };
    return this;
  }

  withEpic(ticketEpics: any) {
    if (!ticketEpics) return this;
    const ticketEpicIds = ticketEpics.split(',');
    this.filters.epic = { $in: ticketEpicIds };
    return this;
  }

  withUsers(users: any) {
    if (!users) return this;
    const userIds = users.split(',');
    this.filters.$or = [
      { assign: { $in: userIds.filter((id: string) => id !== 'unassigned') } },
      ...(userIds.includes('unassigned') ? [{ assign: null }] : []),
    ];
    return this;
  }

  withLabels(labels: any) {
    if (!labels) return this;
    const labelIds = labels.split(',');
    this.filters.tags = { $all: labelIds };
    return this;
  }

  withSprint(sprintId: any) {
    if (!sprintId) return this;
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

  const filters = new BacklogFilterBuilder(projectId)
    .withTitle(title)
    .withType(ticketTypes)
    .withEpic(ticketEpics)
    .withUsers(users)
    .withLabels(labels)
    .build();

  const allTickets = await findTickets(
    req.dbConnection,
    req.tenantsConnection,
    filters,
  );
  return allTickets;
};