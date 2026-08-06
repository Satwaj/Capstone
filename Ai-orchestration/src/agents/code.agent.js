import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();
import {
  ChatMistralAI
} from "@langchain/mistralai"
import {
  listFiles,
  readFiles,
  updateFiles
} from "./tools.js";

import {
  createReactAgent
} from "@langchain/langgraph/prebuilt";


const apiKey = process.env.MISTRAL_API_KEY || process.env.MISTRALAI_API_KEY;
if (apiKey) process.env.MISTRAL_API_KEY = apiKey;

const model = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: apiKey,
  temperature: 0.7,
});

const tools = [listFiles, readFiles, updateFiles];

const agent = createReactAgent({
  llm: model,
  tools: tools,
});

const result = await agent.invoke({
  messages: [
    {
      role: "system",
      content: "You are an expert AI developer agent. When requested to build or modify code in a project:\n1. First call `list_files` to discover the existing project files.\n2. Call `read_files` to inspect the contents of relevant files (e.g. `src/App.jsx`, `src/App.css`, `package.json`, etc.).\n3. Write/update the complete working code by calling `update_files` for all necessary files.\nAlways ensure you actually execute `update_files` so the changes are saved to the project!"
    },
    {
      role: "user",
      content: "create a simple snake game in the project using react and css."
    }
  ]
});

console.log("Agent response:", result);