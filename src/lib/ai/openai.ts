import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

export const openaiClient = apiKey && apiKey !== 'YOUR_OPENAI_API_KEY' && apiKey.trim() !== ''
  ? new OpenAI({ apiKey })
  : null;
