import { Request, Response } from 'express';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../../config/openAi';

const tools = [
  {
    type: 'function',
    name: 'get_weather',
    description: 'Get current temperature for a given location.',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City and country e.g. Bogotá, Colombia',
        },
      },
      required: ['location'],
      additionalProperties: false,
    },
  },
];

export const formatTaskDescription = async (req: Request, res: Response) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  const response = await client.responses.create({
    model: 'gpt-4.1',
    input: 'Write a one-sentence bedtime story about a unicorn.',
  });

  console.log(response.output_text);

  return res.status(200).json();
};
