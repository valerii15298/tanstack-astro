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

  "]: /": "]: /tanstack-astro/",
  ".md)": ")",
  ".md#": "#",
  "](/": "](/tanstack-astro/",
};
function fixLinks(filePath: string): void {
  const content = readFileSync(filePath, "utf8");
  const newContent = Object.entries(replacements).reduce(
    (acc, [oldLink, newLink]) => acc.replaceAll(oldLink, newLink),
    content,
  );
  writeFileSync(filePath, newContent, "utf8");
}

function convertCallouts(filePath: string): void {
  const content = readFileSync(filePath, "utf8");
  const newContent = content.replace(
    /^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n((?:^>.*\n?)*)/gim,
    (_match, type: string, body: string) => {
      const lines = body
        .split("\n")
        .filter((line) => line.startsWith(">"))
        .map((line) => line.replace(/^>\s?/, ""));
      return `:::${type.toLowerCase()}\n${lines.join("\n")}\n:::\n`;
    },
  );
  if (newContent !== content) {
    writeFileSync(filePath, newContent, "utf8");
    console.log(`Converted callouts in ${filePath}`);
  }
}

const filePaths = getMarkdownFiles(docsDir);

filePaths.forEach(addFrontmatter);
filePaths.forEach(fixLinks);
filePaths.forEach(convertCallouts);
