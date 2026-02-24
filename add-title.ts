import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";

const docsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "src/content/docs",
);

function getMarkdownFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return getMarkdownFiles(fullPath);
    if (entry.isFile() && entry.name.endsWith(".md")) return [fullPath];
    return [];
  });
}

function addFrontmatter(filePath: string): void {
  const content = readFileSync(filePath, "utf8");
  if (content.startsWith("---")) return;

  const title = basename(filePath, ".md");
  writeFileSync(filePath, `---\ntitle: ${title}\n---\n${content}`, "utf8");
  console.log(`Added frontmatter to ${filePath}`);
}

const replacements = {
  "](/router/latest/docs/framework/react": "](/router",
  "](/router/latest/docs/framework/solid": "](/router",

  "](/start/latest/docs/framework/react": "](/start",
  "](/start/latest/docs/framework/solid": "](/start",

  "/router/latest/docs/framework/react": "/router",
  "/router/latest/docs/framework/solid": "/router",
  
  "/start/latest/docs/framework/react": "/start",
  "/start/latest/docs/framework/solid": "/start",

  ".md)": ")",
};
function fixLinks(filePath: string): void {
  const content = readFileSync(filePath, "utf8");
  const newContent = Object.entries(replacements).reduce(
    (acc, [oldLink, newLink]) => acc.replaceAll(oldLink, newLink),
    content,
  );
  writeFileSync(filePath, newContent, "utf8");
}

const filePaths = getMarkdownFiles(docsDir);

filePaths.forEach(addFrontmatter);
filePaths.forEach(fixLinks);
