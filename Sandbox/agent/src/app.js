import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(morgan("dev"));

app.use((req, res, next) => {
    console.log("Incoming Request:", req.method, req.url);
    next();
});

app.use(
    express.json({
        limit: "50mb",
    }),
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "50mb",
    }),
);

const WORKING_DIR = "/workspace";

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Agent server is properly Healthy✅",
        status: "success",
    });
});

/** list FILES 1️⃣
 * @route   GET /list-files
 * @description
 * Recursively lists all project files from the sandbox working directory.
 *
 * - Returns file paths relative to the working directory.
 * - Traverses all nested folders recursively.
 * - Excludes dependency folders, build folders, version control folders,
 *   hidden files/directories, and other unnecessary project artifacts.
 *
 * Excluded:
 * - node_modules
 * - .git
 * - dist
 * - build
 * - .env
 * - .DS_Store
 * - Hidden files/folders (starting with ".")
 *
 * Example Response:
 * {
 *   "message": "Project files fetched successfully.",
 *   "files": [
 *     "README.md",
 *     "package.json",
 *     "src/main.jsx",
 *     "src/App.jsx",
 *     "src/components/Button.jsx",
 *     "public/logo.png"
 *   ]
 * }
 */

const EXCLUDED = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    ".env",
    ".DS_Store",
]);

async function getAllFiles(dir, baseDir = dir) {
    const entries = await fs.promises.readdir(dir, {
        withFileTypes: true,
    });

    let files = [];

    for (const entry of entries) {
        // Ignore hidden files/folders
        if (entry.name.startsWith(".")) {
            continue;
        }

        // Ignore excluded folders/files
        if (EXCLUDED.has(entry.name)) {
            continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            const nestedFiles = await getAllFiles(fullPath, baseDir);
            files.push(...nestedFiles);
        } else {
            files.push(path.relative(baseDir, fullPath));
        }
    }

    return files;
}

app.get("/list-files", async (req, res) => {
    try {
        const files = await getAllFiles(WORKING_DIR);

        res.status(200).json({
            message: "Project files fetched successfully.",
            files,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch project files.",
            error: error.message,
        });
    }
});

/** Create files 2️⃣
 * @route   POST /create-files
 * @description
 * Creates one or more project files inside the sandbox working directory.
 *
 * - Accepts an array of files.
 * - Automatically creates missing parent directories.
 * - Overwrites the file if it already exists.
 * - Creates nested folders when required.
 * - All file paths must be relative to the sandbox working directory.
 *
 * Request Body:
 * {
 *   "files": [
 *     {
 *       "file": "README.md",
 *       "content": "# My Project"
 *     },
 *     {
 *       "file": "src/App.jsx",
 *       "content": "export default function App() {}"
 *     },
 *     {
 *       "file": "src/components/Button.jsx",
 *       "content": "export default function Button() {}"
 *     }
 *   ]
 * }
 *
 * Success Response:
 * {
 *   "message": "Files created successfully.",
 *   "createdFiles": [
 *     "README.md",
 *     "src/App.jsx",
 *     "src/components/Button.jsx"
 *   ]
 * }
 */

app.post("/create-files", async (req, res) => {
    try {
        const {
            files
        } = req.body;

        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                message: "Files array is required.",
            });
        }

        const createdFiles = [];

        for (const item of files) {
            const {
                file,
                content
            } = item;

            if (!file || typeof file !== "string") {
                return res.status(400).json({
                    message: "Each file must contain a valid file path.",
                });
            }

            const filePath = path.join(WORKING_DIR, file);

            // Prevent Path Traversal Attack
            const normalizedPath = path.normalize(filePath);

            if (!normalizedPath.startsWith(path.normalize(WORKING_DIR))) {
                return res.status(400).json({
                    message: `Invalid file path: ${file}`,
                });
            }

            // Create folders automatically
            await fs.promises.mkdir(path.dirname(filePath), {
                recursive: true,
            });

            // Create / Overwrite file
            await fs.promises.writeFile(filePath, content ?? "", "utf-8");

            createdFiles.push(file);
        }

        return res.status(201).json({
            message: "Files created successfully.",
            createdFiles,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to create files.",
            error: error.message,
        });
    }
});

/** read files 3️⃣
 * @route   GET /read-file
 * @description
 * Reads the content of a file from the sandbox working directory.
 *
 * - Reads a single file specified by its relative path.
 * - The file path must be provided as a query parameter.
 * - Returns the file path along with its content.
 * - Returns 404 if the file does not exist.
 * - Returns 400 for invalid or missing file paths.
 * - Prevents access outside the sandbox working directory.
 *
 * Query Parameters:
 * - file (required): Relative path of the file.
 *
 * Example:
 * GET /read-file?file=src/App.jsx
 *
 * Success Response:
 * {
 *   "message": "File read successfully.",
 *   "file": "src/App.jsx",
 *   "content": "export default function App() { ... }"
 * }
 */

app.get("/read-file", async (req, res) => {
    try {
        const {
            file
        } = req.query;

        if (!file) {
            return res.status(400).json({
                message: "Query parameter 'file' is required.",
            });
        }

        const filePath = path.join(WORKING_DIR, file);

        // Prevent Path Traversal
        const normalizedPath = path.normalize(filePath);

        if (!normalizedPath.startsWith(path.normalize(WORKING_DIR))) {
            return res.status(400).json({
                message: "Invalid file path.",
            });
        }

        // Check if file exists
        await fs.promises.access(filePath);

        // Read file content
        const content = await fs.promises.readFile(filePath, "utf-8");

        return res.status(200).json({
            message: "File read successfully.",
            file,
            content,
        });
    } catch (error) {
        if (error.code === "ENOENT") {
            return res.status(404).json({
                message: "File not found.",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Failed to read file.",
            error: error.message,
        });
    }
});

/** update files 4️⃣
 * @route   PUT /update-files
 *
 * @description
 * Updates the content of one or more existing files inside the sandbox
 * working directory.
 *
 * This endpoint supports both manual editor updates and AI-generated
 * code updates.
 *
 * Manual Update:
 * - The frontend sends a single file inside the `files` array whenever
 *   the user saves changes from the editor.
 *
 * AI Update:
 * - The AI service sends multiple files inside the `files` array after
 *   generating or modifying a project.
 *
 * Features:
 * - Updates one or multiple files in a single request.
 * - Accepts only relative file paths.
 * - Prevents path traversal attacks.
 * - Returns an error if any requested file does not exist.
 * - Preserves the existing project structure.
 *
 * Request Body:
 * {
 *   "files": [
 *     {
 *       "file": "src/App.jsx",
 *       "content": "..."
 *     },
 *     {
 *       "file": "src/main.jsx",
 *       "content": "..."
 *     }
 *   ]
 * }
 *
 * Manual Update Example:
 * {
 *   "files": [
 *     {
 *       "file": "src/App.jsx",
 *       "content": "Updated App Component"
 *     }
 *   ]
 * }
 *
 * AI Update Example:
 * {
 *   "files": [
 *     {
 *       "file": "src/App.jsx",
 *       "content": "..."
 *     },
 *     {
 *       "file": "src/pages/Home.jsx",
 *       "content": "..."
 *     },
 *     {
 *       "file": "package.json",
 *       "content": "..."
 *     }
 *   ]
 * }
 *
 * Success Response:
 * {
 *   "message": "Files updated successfully.",
 *   "updatedFiles": [
 *     "src/App.jsx",
 *     "src/main.jsx"
 *   ]
 * }
 */

app.put("/update-files", async (req, res) => {
    console.log("UPDATE ROUTE HIT");

    try {
        const {
            files
        } = req.body;

        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                message: "Files array is required.",
            });
        }

        const updatedFiles = [];

        for (const item of files) {
            const {
                file,
                content
            } = item;

            if (!file || typeof file !== "string") {
                return res.status(400).json({
                    message: "Each file must contain a valid file path.",
                });
            }

            const filePath = path.join(WORKING_DIR, file);

            // Prevent Path Traversal
            const normalizedPath = path.normalize(filePath);

            if (!normalizedPath.startsWith(path.normalize(WORKING_DIR))) {
                return res.status(400).json({
                    message: `Invalid file path: ${file}`,
                });
            }

            // Check if file exists
            await fs.promises.access(filePath);

            // Update content
            await fs.promises.writeFile(filePath, content ?? "", "utf-8");

            updatedFiles.push(file);
        }

        return res.status(200).json({
            message: "Files updated successfully.",
            updatedFiles,
        });
    } catch (error) {
        if (error.code === "ENOENT") {
            return res.status(404).json({
                message: "One or more files were not found.",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Failed to update files.",
            error: error.message,
        });
    }
});

/** delete FILes 5️⃣
 * @route   DELETE /delete-files
 *
 * @description
 * Deletes one or more files from the sandbox working directory.
 *
 * This endpoint supports both manual file deletion from the editor
 * and AI-generated file cleanup.
 *
 * Manual Delete:
 * - The frontend sends one or more file paths when the user deletes
 *   files from the file explorer.
 *
 * AI Delete:
 * - The AI service sends multiple file paths to remove unnecessary
 *   files while restructuring or regenerating a project.
 *
 * Features:
 * - Deletes one or multiple files in a single request.
 * - Accepts only relative file paths.
 * - Prevents path traversal attacks.
 * - Returns an error if any requested file does not exist.
 * - Does not delete directories.
 *
 * Request Body:
 * {
 *   "files": [
 *     "src/App.jsx",
 *     "src/components/Navbar.jsx",
 *     "README.md"
 *   ]
 * }
 *
 * Success Response:
 * {
 *   "message": "Files deleted successfully.",
 *   "deletedFiles": [
 *     "src/App.jsx",
 *     "src/components/Navbar.jsx"
 *   ]
 * }
 */

app.delete("/delete-files", async (req, res) => {
    try {
        const {
            files
        } = req.body;

        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                message: "Files array is required.",
            });
        }

        const deletedFiles = [];

        for (const file of files) {
            if (!file || typeof file !== "string") {
                return res.status(400).json({
                    message: "Each file must be a valid file path.",
                });
            }

            const filePath = path.join(WORKING_DIR, file);

            // Prevent Path Traversal
            const normalizedPath = path.normalize(filePath);

            if (!normalizedPath.startsWith(path.normalize(WORKING_DIR))) {
                return res.status(400).json({
                    message: `Invalid file path: ${file}`,
                });
            }

            // Check if file exists
            await fs.promises.access(filePath);

            // Ensure it is a file
            const stats = await fs.promises.stat(filePath);

            if (!stats.isFile()) {
                return res.status(400).json({
                    message: `${file} is not a file.`,
                });
            }

            // Delete file
            await fs.promises.unlink(filePath);

            deletedFiles.push(file);
        }

        return res.status(200).json({
            message: "Files deleted successfully.",
            deletedFiles,
        });
    } catch (error) {
        if (error.code === "ENOENT") {
            return res.status(404).json({
                message: "One or more files were not found.",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Failed to delete files.",
            error: error.message,
        });
    }
});

/** delete-folder 6️⃣
 * @route   DELETE /delete-folder
 *
 * @description
 * Deletes a folder and all of its contents recursively from the sandbox
 * working directory.
 *
 * This endpoint supports both manual folder deletion from the editor
 * and AI-generated project cleanup.
 *
 * Manual Delete:
 * - The frontend sends the relative folder path when the user deletes
 *   a folder from the file explorer.
 *
 * AI Delete:
 * - The AI service sends the folder path to remove an entire directory
 *   that is no longer required.
 *
 * Features:
 * - Deletes a folder recursively, including all nested files
 *   and subfolders.
 * - Accepts only relative folder paths.
 * - Prevents path traversal attacks.
 * - Returns an error if the folder does not exist.
 * - Returns an error if the provided path is not a directory.
 *
 * Request Body:
 * {
 *   "folder": "src/components"
 * }
 *
 * Success Response:
 * {
 *   "message": "Folder deleted successfully.",
 *   "deletedFolder": "src/components"
 * }
 */

app.delete("/delete-folder", async (req, res) => {
    try {
        const {
            folder
        } = req.body;

        if (!folder || typeof folder !== "string") {
            return res.status(400).json({
                message: "Folder path is required.",
            });
        }

        const folderPath = path.join(WORKING_DIR, folder);

        // Prevent Path Traversal
        const normalizedPath = path.normalize(folderPath);

        if (!normalizedPath.startsWith(path.normalize(WORKING_DIR))) {
            return res.status(400).json({
                message: "Invalid folder path.",
            });
        }

        // Check if folder exists
        await fs.promises.access(folderPath);

        // Ensure it is a directory
        const stats = await fs.promises.stat(folderPath);

        if (!stats.isDirectory()) {
            return res.status(400).json({
                message: `${folder} is not a directory.`,
            });
        }

        // Delete folder recursively
        await fs.promises.rm(folderPath, {
            recursive: true,
            force: false,
        });

        return res.status(200).json({
            message: "Folder deleted successfully.",
            deletedFolder: folder,
        });
    } catch (error) {
        if (error.code === "ENOENT") {
            return res.status(404).json({
                message: "Folder not found.",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Failed to delete folder.",
            error: error.message,
        });
    }
});

/** Renames files 7️⃣
 * @route   PUT /move-file
 *
 * @description
 * Renames or moves a file or directory inside the sandbox working directory.
 *
 * This endpoint supports both manual file explorer operations and
 * AI-generated project restructuring.
 *
 * Manual Usage:
 * - Rename a file or folder.
 * - Move a file or folder to another directory.
 *
 * AI Usage:
 * - Rename project files.
 * - Reorganize folders.
 * - Move generated files into the appropriate project structure.
 *
 * Features:
 * - Supports both files and directories.
 * - Supports rename and move using a single endpoint.
 * - Automatically creates missing destination directories.
 * - Accepts only relative paths.
 * - Prevents path traversal attacks.
 * - Returns an error if the source path does not exist.
 *
 * Request Body:
 * {
 *   "source": "src/App.jsx",
 *   "destination": "src/components/Main.jsx"
 * }
 *
 * Rename Example:
 * {
 *   "source": "src/App.jsx",
 *   "destination": "src/Main.jsx"
 * }
 *
 * Move Example:
 * {
 *   "source": "src/App.jsx",
 *   "destination": "src/components/App.jsx"
 * }
 *
 * Success Response:
 * {
 *   "message": "Resource moved successfully.",
 *   "source": "src/App.jsx",
 *   "destination": "src/components/Main.jsx"
 * }
 */

app.put("/move-file", async (req, res) => {
    try {
        const {
            source,
            destination
        } = req.body;

        if (!source || !destination) {
            return res.status(400).json({
                message: "Source and destination paths are required.",
            });
        }

        const sourcePath = path.join(WORKING_DIR, source);
        const destinationPath = path.join(WORKING_DIR, destination);

        // Prevent Path Traversal
        const normalizedSource = path.normalize(sourcePath);
        const normalizedDestination = path.normalize(destinationPath);

        if (
            !normalizedSource.startsWith(path.normalize(WORKING_DIR)) ||
            !normalizedDestination.startsWith(path.normalize(WORKING_DIR))
        ) {
            return res.status(400).json({
                message: "Invalid source or destination path.",
            });
        }

        // Check source exists
        await fs.promises.access(sourcePath);

        // Create destination folder automatically
        await fs.promises.mkdir(path.dirname(destinationPath), {
            recursive: true,
        });

        // Rename / Move
        await fs.promises.rename(sourcePath, destinationPath);

        return res.status(200).json({
            message: "Resource moved successfully.",
            source,
            destination,
        });
    } catch (error) {
        if (error.code === "ENOENT") {
            return res.status(404).json({
                message: "Source file or folder not found.",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Failed to move resource.",
            error: error.message,
        });
    }
});

export default app;