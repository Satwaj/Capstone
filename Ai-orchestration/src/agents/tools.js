import axios from 'axios';
import {
  tool
} from "langchain"
import * as z from "zod";

export const listFiles = tool(
  async () => {
    console.log("=================================");
    console.log("using list files tool");
    console.log("=================================");

    console.log("1. Before axios");

    const baseUrl = process.env.SANDBOX_API_URL || "http://019fd12f-b7ff-7549-9d84-283b17cbe90e.agent.localhost";

    try {
      const response = await axios.get(
        `${baseUrl}/list-files`, {
          headers: { Host: "019fd12f-b7ff-7549-9d84-283b17cbe90e.agent.localhost" },
          timeout: 15000,
        }
      );


      console.log("=================================");
      console.log("response from list files tool");
      console.log(response.data);
      console.log("=================================");

      return JSON.stringify(response.data.files);
    } catch (err) {
      console.error("Error calling list-files:", err.message);
      return JSON.stringify({ error: err.message });
    }
  }, {
    name: "list_files",
    description: "List all the files in the project directory. This is useful for understanding what files are available to work with.",
    schema: z.object({}),
  }
);



export const readFiles = tool(
  async ({
    files
  }) => {

    console.log("=================================")
    console.log("using read files tool with files", files)
    console.log("=================================")

    const baseUrl = process.env.SANDBOX_API_URL || "http://019fd12f-b7ff-7549-9d84-283b17cbe90e.agent.localhost";
    const response = await axios.get(`${baseUrl}/read-files?files=` + files.join(","), {
      headers: { Host: "019fd12f-b7ff-7549-9d84-283b17cbe90e.agent.localhost" }
    })

    console.log("=================================")
    console.log("response from read files tool", response.data)
    console.log("=================================")
    return JSON.stringify(response.data);
  }, {
    name: "read_files",
    description: "Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
    schema: z.object({
      files: z.array(z.string()).describe("The list of files absolute paths to read. These should be files that were listed using the list_files tool or created later")
    })
  }
)

export const updateFiles = tool(
  async ({
    files
  }) => {

    console.log("=================================")
    console.log("using update files tool with files", files)
    console.log("=================================")

    const baseUrl = process.env.SANDBOX_API_URL || "http://019fd12f-b7ff-7549-9d84-283b17cbe90e.agent.localhost";
    const response = await axios.patch(`${baseUrl}/update-files`, {
      updates: files
    }, {
      headers: { Host: "019fd12f-b7ff-7549-9d84-283b17cbe90e.agent.localhost" }
    })
    console.log("=================================")
    console.log("response from update files tool", response.data)
    console.log("=================================")

    return JSON.stringify(response.data.results);
  }, {
    name: "update_files",
    description: "Update the contents of specified files. This is useful for making changes to files based on the requirements of the task at hand. this tool can also use to create new files by providing a new file name in the file field and the content to be added in the content field.",
    schema: z.object({
      files: z.array(z.object({
        file: z.string().describe("The absolute path of the file to update"),
        content: z.string().describe("The new content for the file, the content should support json format.")
      })).describe("The list of files to update and their new contents")
    })
  }
)
