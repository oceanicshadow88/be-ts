/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const appRoot = path.dirname(require?.main?.filename ?? '');
const parentDirectory = path.resolve(appRoot, '..');
const LOGGLY_ENDPOINT = process.env.LOGGLY_ENDPOINT;
const LOG_DIR = path.join(parentDirectory, 'storage', 'logs');

const getLogFiles = () => {
  return fs.readdirSync(LOG_DIR)
    .filter(file => file.startsWith('logger-') && file.endsWith('.log'))
    .map(file => path.join(LOG_DIR, file));
};

const processLogFile = async (logFile: string) => {
  const logData = await fs.promises.readFile(logFile, 'utf8');
  if (!logData) {
    console.log(`Log file ${logFile} is empty.`);
    return { file: logFile, status: 'empty' };
  }

  const response = await axios.post(LOGGLY_ENDPOINT as string, logData, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });

  if (response.status !== 200) {
    throw new Error(`Loggly responded with status: ${response.status}, data: ${JSON.stringify(response.data)}`);
  }

  console.log(`Successfully sent log file ${logFile} to Loggly`);
  return { file: logFile, status: 'success' };
};

const sendLogsToLoggly = async () => {
  const logFiles = getLogFiles();

  if (!logFiles.length) {
    console.log('No log files found to send.');
    return;
  }

  const results = await Promise.all(logFiles.map(processLogFile));

  for (const file of logFiles) {
    await fs.promises.unlink(file);
    console.log(`Deleted log file ${file}`);
  }

  console.log('All log files processed successfully, results:', results);
};

sendLogsToLoggly().catch(err => {
  console.error('Failed to send logs to Loggly:', err.message);
  process.exit(1);
});