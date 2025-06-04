import amqp from 'amqplib';
import { config } from '../config/app';

const RABBITMQ_URL = config.rabbitMQUrl;

let exchangeName = 'import_exchange';
let routingKey = 'import.csv';

export const sendCsvToMicroService = async (
  filePath: string,
  tenantId: string,
  ownerId: string,
  isTest: string = 'false',
): Promise<void> => {
  const message = {
    filePath,
    tenantId,
    ownerId,
  };

  if (isTest === 'true') {
    exchangeName = 'test_import_exchange';
    routingKey = 'test.import.csv';
  }

  if (!RABBITMQ_URL) {
    throw new Error('RABBITMQ_URL is not set');
  }

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, 'direct', { durable: true });

  channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  await channel.close();
  await connection.close();
};
