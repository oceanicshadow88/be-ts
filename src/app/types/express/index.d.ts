declare namespace Express {
  interface Request {
    dbConnection: any;
    dbName: string;
    userConnection: any;
    tenantId: string;
    dataConnectionPool: any;
    tenantsConnection: any;
    ownerId: string;
    isOwner: boolean;
  }
}
