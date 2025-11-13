export {};
import { SES } from '@aws-sdk/client-ses';
import { SESv2 } from '@aws-sdk/client-sesv2';
const { tenantsDBConnection, tenantDBConnection, PUBLIC_DB } = require('../database/connections');
import config from '../config/app';
import whois from 'whois-json';
import awsConfig from '../config/aws';
import { winstonLogger } from '../../loaders/logger';

interface RegistrationData {
  domainStatus?: string | undefined;
}
const sesv2 = new SESv2(awsConfig);
const ses = new SES(awsConfig);

const hasAllRequiredTemplates = async () => {
  const awsRes = await sesv2.listEmailTemplates({ PageSize: 10 });
  const requiredTemplates = [
    'Subscription',
    'CustomEmailVerify',
    'Access',
    'contactPageEmailTemplate',
    'ForgotPassword',
  ];
  const existingTemplates = awsRes?.TemplatesMetadata?.filter((template: any) =>
    requiredTemplates.includes(template.TemplateName),
  );
  return existingTemplates?.length === requiredTemplates.length
    ? '\x1b[32mSuccess\x1b[0m'
    : '\x1b[31mFailed\x1b[0m';
};

const hasSES = async (domain: string) => {
  const awsRes = await ses.getIdentityVerificationAttributes({ Identities: [domain] });
  return awsRes.VerificationAttributes?.[domain]
    ? '\x1b[32mSuccess\x1b[0m'
    : '\x1b[31mFailed\x1b[0m';
};

const isValidDomain = async (domain: string) => {
  if (process.env.ENVIRONMENT === 'local') return '\x1b[32mSuccess\x1b[0m';
  const domainData = (await whois(domain)) as RegistrationData;
  return domainData?.domainStatus ? '\x1b[32mSuccess\x1b[0m' : '\x1b[31mFailed\x1b[0m';
};

const DB_CONNECTED = 1;

export const healthCheck = async () => {
  const tenantsDbConnection = await tenantsDBConnection();
  const tenantDbConnection = await tenantDBConnection(PUBLIC_DB);
  const domain = config.mainDomain ?? '';
  const tenantsDbConnect =
    tenantsDbConnection.readyState !== DB_CONNECTED
      ? '\x1b[31mFailed\x1b[0m'
      : '\x1b[32mSuccess\x1b[0m';
  const tenantDbConnect =
    tenantDbConnection.readyState !== DB_CONNECTED
      ? '\x1b[31mFailed\x1b[0m'
      : '\x1b[32mSuccess\x1b[0m';

  const validDomain = await isValidDomain(domain);

  const hasAllTemplatesUploaded = config.devopsMode
    ? '\x1b[32mSuccess\x1b[0m'
    : await hasAllRequiredTemplates();
  const connectedAws = config.devopsMode ? '\x1b[32mSuccess\x1b[0m' : await hasSES(domain);
  const message =
    '\nTenantsDb Connect: ' +
    tenantsDbConnect +
    ' \n' +
    'TenantDb Connect: ' +
    tenantDbConnect +
    '\n' +
    `Domain(${domain}) Connect: ${validDomain}` +
    `\nAWS SES: ${connectedAws}\n` +
    'AWS SES Templates: ' +
    hasAllTemplatesUploaded +
    '\n';
  winstonLogger.info(message.replace(/\[\d+m/g, '').replace(/\x1B\[\d+m/g, ''));
  return message;
};
