import { OpenAI } from "openai";

const API_KEY = process.env.API_KEY;
export const client = new OpenAI({
  apiKey: API_KEY,
});
