import { promises as fs } from "fs";
import * as path from "path";

const root = process.cwd();

async function findAndDeleteDirs(dir: string, targets: string[]) {
   const entries = await fs.readdir(dir, { withFileTypes: true });
   await Promise.all(
      entries.map(async (entry) => {
         const fullPath = path.join(dir, entry.name);
         if (entry.isDirectory()) {
            if (targets.includes(entry.name)) {
               console.log(`Deleting directory: ${fullPath}`);
               await fs.rm(fullPath, { recursive: true, force: true });
            } else {
               await findAndDeleteDirs(fullPath, targets);
            }
         }
      }),
   );
}

async function removeLockFiles(dir: string) {
   const lockFiles = [
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
   ];
   for (const file of lockFiles) {
      const filePath = path.join(dir, file);
      try {
         await fs.unlink(filePath);
         console.log(`Deleted lock file: ${filePath}`);
      } catch (err) {
         if (err.code !== "ENOENT") throw err;
      }
   }
}

(async () => {
   await findAndDeleteDirs(root, ["node_modules", ".svelte-kit"]);
   await removeLockFiles(root);
   console.log("Project cleaned.");
})();
