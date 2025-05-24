import amqp from 'amqplib';
import mongoose from 'mongoose';
import { processCsv } from '../services/importService';
import { getMqConnection } from '../services/mq/connection';

const QUEUE = 'csvImportQueue';

let consumerChannel: amqp.Channel | null = null;

const initComsumerChannel = async (): Promise<amqp.Channel> => {
  if (!consumerChannel) {
    const conn = await getMqConnection();
    consumerChannel = await conn.createChannel();
  }
  return consumerChannel;
};

const startWorker = async () => {
  const channel = await initComsumerChannel();
  await channel.assertQueue(QUEUE, { durable: true });

  console.log(`Worker started, waiting for messages in queue: ${QUEUE}`);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) {
      console.log('No message received');
      return;
    }

    try {
      const { tenantId, ownerId, csvBase64 } = JSON.parse(msg.content.toString());

      const db = await mongoose.createConnection(process.env.PUBLIC_CONNECTION || '').asPromise();
      const csvBuffer = Buffer.from(csvBase64, 'base64');

      // Process the CSV data here
      await processCsv(csvBuffer, db, tenantId, ownerId);

      await db.close();

      channel.ack(msg);
    } catch (err) {
      console.error('Error processing message:', err);
      channel.nack(msg, false, false);
    }
  });
};

startWorker();
