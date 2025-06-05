import amqp from 'amqplib';
import { sendCsvToMicroService } from '../../src/app/services/importMicroService';

// Mock amqplib
jest.mock('amqplib');

describe('ImportMicroService', () => {
  const TEST_EXCHANGE = 'test_import_exchange';
  const TEST_ROUTING_KEY = 'test.import.csv';
  let mockChannel;
  let mockConnection;
  let receivedMessages = [];

  beforeEach(() => {
    // Clear all mocks and received messages before each test
    jest.clearAllMocks();
    receivedMessages = [];

    // Setup mock channel and connection
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest.fn().mockResolvedValue({ queue: 'test-queue' }),
      bindQueue: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn().mockImplementation((queue, callback) => {
        // Store the callback for later use
        mockChannel.callback = callback;
      }),
      publish: jest.fn().mockImplementation((exchange, routingKey, content, options) => {
        // Trigger the consumer callback when a message is published
        if (mockChannel.callback) {
          const message = {
            content: content,
            fields: {
              exchange,
              routingKey,
            },
            properties: options,
          };
          mockChannel.callback(message);
        }
      }),
      ack: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(undefined),
    };

    amqp.connect.mockResolvedValue(mockConnection);
  });

  it('should send CSV to microservice and consumer should receive the message', async () => {
    // Setup consumer
    const connection = await amqp.connect();
    const channel = await connection.createChannel();

    await channel.assertExchange(TEST_EXCHANGE, 'direct', { durable: true });
    const { queue } = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue, TEST_EXCHANGE, TEST_ROUTING_KEY);

    // Setup message consumer
    await channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        receivedMessages.push(content);
        channel.ack(msg);
      }
    });

    // Send message
    const filePath = 'test.csv';
    const tenantId = 'test-tenant';
    const ownerId = 'test-owner';

    await sendCsvToMicroService(filePath, tenantId, ownerId, TEST_EXCHANGE, TEST_ROUTING_KEY);

    // Verify that the exchange was asserted
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(TEST_EXCHANGE, 'direct', {
      durable: true,
    });

    // Verify that the message was published
    expect(mockChannel.publish).toHaveBeenCalledWith(
      TEST_EXCHANGE,
      TEST_ROUTING_KEY,
      expect.any(Buffer),
      { persistent: true },
    );

    // Verify the message content
    const publishedMessage = JSON.parse(mockChannel.publish.mock.calls[0][2].toString());
    expect(publishedMessage).toEqual({
      filePath,
      tenantId,
      ownerId,
    });

    // Verify that the consumer received the message
    expect(receivedMessages).toHaveLength(1);
    expect(receivedMessages[0]).toEqual({
      filePath,
      tenantId,
      ownerId,
    });

    // Verify that the message was acknowledged
    expect(mockChannel.ack).toHaveBeenCalled();

    // Cleanup
    await channel.close();
    await connection.close();
  });

  afterEach(async () => {
    // Cleanup any remaining connections
    if (mockConnection) {
      await mockConnection.close();
    }
  });
});
