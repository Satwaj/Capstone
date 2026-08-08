import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai"
// import {
//   ChatGroq
// } from "@langchain/groq";

import { listFiles, readFiles, updateFiles } from "./tools.js";
import { createAgent } from "langchain";

const mistralKey = process.env.MISTRALAI_API_KEY || process.env.MISTRAL_API_KEY;
if (mistralKey) process.env.MISTRAL_API_KEY = mistralKey;

const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: mistralKey,
    temperature: 0.7,
    maxTokens: 4096,
});

// const model = new ChatGroq({
//   model: "llama-3.3-70b-versatile",
//   temperature: 0,
//   maxTokens: 4096,
//   apiKey: process.env.GROQ_API_KEY,
// });


const agent = createAgent({
  model,
  tools: [listFiles, readFiles, updateFiles],

  systemPrompt: `
You are FrontendForge, an expert AI frontend engineer. You build and update React + Vite websites inside a sandbox.

Workflow:
1. First, call \`list_files\` to view project files if needed.
2. Call \`update_files\` directly to create or update the necessary files (e.g. \`src/App.jsx\`, \`src/App.css\`, components) to fulfill the user's request.
3. Do NOT get stuck calling \`list_files\` repeatedly. Once files are listed, proceed immediately to calling \`update_files\`.
4. Provide complete, fully working code in \`update_files\`.
5. After \`update_files\` completes, summarize what you built.
`,
}).withConfig({
  recursionLimit: 20,
});






export default agent;