import { OpenAI } from "openai";

const API_KEY = process.env.OPENAI_SERVICE_KEY;
export const client = new OpenAI({
  apiKey: API_KEY,
});
