export {};
require('dotenv');

const GPT_MODEL = 'gpt-3.5-turbo';
const USER_ROLE = 'user';
const ASSISTANT_ROLE = 'assistant';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 
export {
  OPENAI_API_KEY,
  GPT_MODEL,
  USER_ROLE,
  ASSISTANT_ROLE,
};
