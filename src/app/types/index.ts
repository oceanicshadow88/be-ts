import { Types } from 'mongoose';

export interface ITicket {
  id: string;
  title: string;
  labels: string[];
  comments: string[];
  status: {
    id: string;
    name: string;
    slug: string;
    order: number;
  };
  priority: string;
  project: string;
  board: string;
  sprintId: string | null;
  description: string;
  storyPoint: number;
  dueAt: string;
  reporter: {
    id: string;
    email: string;
    avatarIcon: string;
    name: string;
  };
  assign: string | null;
  type: {
    id: string;
    slug: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    icon: string;
  };
  isActive: boolean;
  attachmentUrls: string[];
  createdAt: string;
  updatedAt: string;
  ticketNumber: string;
  temp?: string | null;
}

import { Document } from 'mongoose';

export interface ITicketDocument extends Document {
  _id: Types.ObjectId;
  title: string;

  labels: {
    _id: Types.ObjectId;
    name: string;
  }[];

  comments: string[];

  status: {
    _id: Types.ObjectId;
    name: string;
  };

  priority: string;
  project: {
    _id: Types.ObjectId;
    name: string;
  };
  board: string;

  sprint: {
    _id: Types.ObjectId;
    name: string;
  } | null;

  description: string;
  storyPoint: number;
  dueAt: string;

  reporter: {
    name: string;
  };

  assign: {
    _id: Types.ObjectId;
    name: string;
  } | null;

  type: {
    _id: Types.ObjectId;
    name: string;
  };

  isActive: boolean;
  attachmentUrls: string[];
  createdAt: string;
  updatedAt: string;

  epic?: {
    _id: Types.ObjectId;
    name: string;
  };
}

export //====== dashboard ======

enum StatusName {
  TO_DO = 'to do',
  IN_PROGRESS = 'in progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum SupportType {
  NO_SUPPORT,
  TECHNICAL,
  REQUIREMENT,
  DEPENDENCY,
  OTHER,
}

export interface IProgress {
  timeStamp: number;
  _id: string;
  value: number;
}

export interface IDailyScrum {
  _id: Types.ObjectId;
  user: {
    _id: Types.ObjectId;
    name: string;
  };
  title: string;
  progresses: IProgress[];
}

export interface IDailyScrumTimeStampModified extends Omit<IDailyScrum, 'progresses'> {
  progresses: {
    timeStamp: string;
    _id: string;
    value: number;
  }[];
}

export interface IPriceInfo {
  stripePriceId: string;
  subscriptionAmount: number;
  subscriptionPeriod: string;
}

export interface IPrices {
  monthly?: IPriceInfo | null;
  yearly?: IPriceInfo | null;
}

export interface IProductInfo {
  _id: Types.ObjectId;
  stripeProductId: string;
  stripeProductName: string;
  stripeProductDescription: string;
  stripePrices: IPrices;
}

export enum ActivityType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface IChange {
  field: string;
  prevValues: Array<string>;
  afterValues: Array<string>;
}

export interface ITenantTrialHistory {
  _id: Types.ObjectId;
  productId: string;
  priceIds: string[];
}
