import amqp, { ChannelModel } from 'amqplib';

let connection: amqp.ChannelModel | null = null;

export const getMqConnection = async (): Promise<ChannelModel> => {
  if (!connection) {
    connection = await amqp.connect('amqp://localhost');
  }
  return connection;
};
