import amqp from 'amqplib';
import { config } from '../config/app';

const isLocal = config.environment  === 'development' || config.environment === 'local';
const RABBITMQ_URL = isLocal
  ? 'amqp://localhost'
  : process.env.RABBITMQ_URL ?? 'amqp://localhost';
  
const EXCHANGE_NAME = 'import_exchange';
const ROUTING_KEY = 'import.csv';

export const sendCsvToMicroService = async (
  filePath: string,
  tenantId: string,
  ownerId: string,
): Promise<void> => {
  const message = {
    filePath,
    tenantId,
    ownerId,
  };

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

  channel.publish(
    EXCHANGE_NAME,
    ROUTING_KEY,
    Buffer.from(JSON.stringify(message)),
    { persistent: true },
  );

  await channel.close();
  await connection.close();
};