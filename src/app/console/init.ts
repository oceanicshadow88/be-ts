/* eslint-disable no-console */
export {};

import readline from 'readline';
import mongoose from 'mongoose';
import config from '../config/app';
import fs from 'fs';
import path from 'path';
import * as Tenant from '../model/tenants';
import * as healthCheckService from '../services/healthCheckService';
import { createUser } from './temp';
const options = {
  useNewURLParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  socketTimeoutMS: 30000,
};

const tenantsDBConnection = () => {
  return mongoose.createConnection(config.tenantsDBConnection, options);
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const init = async (domainInput: string, emailInput: string, passwordInput: string) => {
  try {
    const emailAdd = emailInput || 'techscrum@gmail.com';
    const domain = domainInput || 'http://localhost:3000';
    const password = passwordInput || '12345678';
    if (process.env.ENVIRONMENT === 'production') {
      if (emailAdd === 'techscrum@gmail.com' || password === '12345678') {
        console.log(
          '\x1b[31mYOU ARE IGNORING IMPORTANT INFORMATION AND CAUSING SERIOUS SECURITY ISSUE. ABORT\x1b[0m',
        );
        process.exit();
      }
    }
    const tenantsDbConnection = await tenantsDBConnection();
    const tenantModel = Tenant.getModel(tenantsDbConnection);
    const tenant = await tenantModel.findOneAndUpdate(
      { origin: domain },
      { origin: domain },
      { upsert: true, new: true },
    );
    const resUser = await createUser(tenantsDbConnection, emailAdd, password, tenant);
    const activeTenant = resUser.tenants.at(-1);
    await tenantModel.findByIdAndUpdate(activeTenant, {
      active: true,
      owner: new mongoose.Types.ObjectId(resUser._id),
    });

    console.error(
      '\x1b[31mNow please FOLLOW README.MD and start up your BACKEND and FRONTEND server!\x1b[0m',
    );
    console.log(
      'Create success \n\x1b[32mLogin details:\n',
      'Frontend Domain: ' + domain + '\n',
      'Email: ' + emailAdd + '\n',
      'Password: ' + password + '\x1b[0m\n',
    );
    process.exit();
  } catch (e: any) {
    if (e.message.includes('duplicate key')) {
      console.error('\x1b[31mEmail already exists in database\x1b[0m');
      process.exit(1);
    }
    console.error(e);
    process.exit(1);
  }
};

function isValidDomain(domain: string): boolean {
  const pattern = new RegExp(
    '^https?:\\/\\/' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,})' + // domain name
      '(:[0-9]{1,5})?' + // optional port
      '(?<!\\/)$',
    'i',
  );
  return pattern.test(domain);
}

const askForDomain = (next: any) => {
  rl.question(
    'Please enter the FRONTEND domain (http://localhost:3000): ',
    (domain: string = 'http://localhost:3000') => {
      if (domain === '') {
        next('http://localhost:3000');
        return;
      }
      if (isValidDomain(domain)) {
        next(domain);
      } else {
        console.log('\x1b[31mError: Invalid domain entered. Please try again.\x1b[0m');
        askForDomain(next);
      }
    },
  );
};

try {
  if (config.devopsMode) {
    fs.rmSync('.circleci', { recursive: true, force: true });
    fs.unlinkSync(path.join(process.cwd(), 'sonar-project.properties'));
  }
} catch (e) {}

if (
  process.env.ENVIRONMENT !== 'production' &&
  process.env.ENVIRONMENT !== 'develop' &&
  process.env.ENVIRONMENT !== 'local'
) {
  console.error('\x1b[31mABORT!!! ENVIRONMENT has not set up correctly in .env file\x1b[0m');
  console.error(
    '\x1b[31mPlease ensure that you have read the README.md / DEVOPS_README.md carefully, you are ignoring important information \x1b[0m',
  );
  process.exit();
}

console.log(
  '\x1b[31mDEVOPS IMPORTANT!!! DON"T use the default email OR password for PRODUCTION environment, SERIOUS SECURITY ISSUE!!!\x1b[0m',
);

rl.question('Please type confirm when you have READ ABOVE MESSAGE: ', async (answer: string) => {
  if (answer.toLowerCase() !== 'confirm') {
    console.log('\x1b[31mABORT!!! EXIT\x1b[0m');
    console.error('\x1b[31mPlease be carefully, you are IGNORING IMPORTANT information\x1b[0m');
    process.exit();
  }

  const healthCheckMessage = await healthCheckService.healthCheck();
  console.log(healthCheckMessage);
  if (healthCheckMessage.includes('Failed')) {
    console.log('\x1b[31mABORT!!! One or more item FAILED in above list \x1b[0m \n');
    process.exit();
  }

  askForDomain((domain: string) => {
    rl.question('Please enter the user email (techscrum@gmail.com): ', (email: string) => {
      rl.question('Please enter the user password (12345678): ', (password: string) => {
        init(domain, email, password);
      });
    });
  });
});
