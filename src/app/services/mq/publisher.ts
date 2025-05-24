import amqp from 'amqplib';
import { getMqConnection } from './connection';

let publisherChannel: amqp.Channel | null = null;

export const initPublisherChannel = async (): Promise<amqp.Channel> => {
  if (!publisherChannel) {
    const conn = await getMqConnection();
    publisherChannel = await conn.createChannel();
  }
  return publisherChannel;
};

export const sendMessageToQueue = async (queue: string, payload: any): Promise<void> => {
  const ch = await initPublisherChannel();
  await ch.assertQueue(queue, { durable: true });
  const message = JSON.stringify(payload);

  ch.sendToQueue(queue, Buffer.from(message), { persistent: true });
  console.log(`Message sent to queue ${queue}`);
};
