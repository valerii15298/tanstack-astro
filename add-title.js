import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dirPath = `${__dirname}/src/content/docs`;

// traverse all files in the directory recursively and if the file is a markdown file and
// does not have frontmatter, add frontmatter with the title being the filename without the extension
function traverseDirectory(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = `${dir}/${file}`;
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error stating file ${filePath}:`, err);
          return;
        }

        if (stats.isDirectory()) {
          traverseDirectory(filePath);
        } else if (stats.isFile() && file.endsWith(".md")) {
          fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
              console.error(`Error reading file ${filePath}:`, err);
              return;
            }

            if (!data.startsWith("---")) {
              const title = file.replace(".md", "");
              const frontMatter = `---\ntitle: ${title}\n---\n`;
              const newData = frontMatter + data;
              fs.writeFile(filePath, newData, "utf8", (err) => {
                if (err) {
                  console.error(`Error writing file ${filePath}:`, err);
                } else {
                  console.log(`Added frontmatter to ${filePath}`);
                }
              });
            }
          });
        }
      });
    });
  });
}

traverseDirectory(dirPath);
