import * as fs from "fs";
import * as path from "path";

const messagesDir = path.join(process.cwd(), "messages");
const schemaObj = {
   "$schema": "https://inlang.com/schema/inlang-message-format",
};

fs.readdir(messagesDir, (err, files) => {
   if (err) {
      console.error("Failed to read messages directory:", err);
      process.exit(1);
   }

   files.forEach((file) => {
      if (
         file.endsWith(".json") &&
         file !== "en.json"
      ) {
         const filePath = path.join(messagesDir, file);
         fs.writeFile(
            filePath,
            JSON.stringify(schemaObj, null, 2) + "\n",
            (err) => {
               if (err) {
                  console.error(`Failed to write ${file}:`, err);
               } else {
                  console.log(`Emptied ${file}`);
               }
            },
         );
      }
   });
});
