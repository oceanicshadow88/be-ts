import dotenv from 'dotenv';
dotenv.config();

const CLAUDE_MODEL = process.env.CLAUDE_MODEL;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY; 
export {
  CLAUDE_API_KEY,
  CLAUDE_MODEL,
};
