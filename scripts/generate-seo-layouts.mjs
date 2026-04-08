import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, "../src/app/[locale]");

const routes = [
  ["api-snippet", "apiSnippetPage"],
  ["http-status", "httpStatusPage"],
  ["cron", "cronPage"],
  ["function-plot", "functionPlotPage"],
  ["cidr", "cidrPage"],
  ["unicode", "unicodePage"],
  ["json-diff", "jsonDiffPage"],
  ["lorem", "loremPage"],
  ["slug", "slugPage"],
  ["css-min", "cssMinPage"],
  ["html-entities", "htmlEntitiesPage"],
  ["csv-json", "csvJsonPage"],
  ["jwt", "jwtPage"],
  ["hash", "hashPage"],
  ["audio", "audio"],
  ["video-gif", "videoGif"],
  ["image", "image"],
  ["qr", "qr"],
  ["text", "text"],
  ["data", "data"],
  ["color", "color"],
  ["code", "code"],
  ["markdown", "markdown"],
  ["money", "money"],
  ["translate", "translate"],
  ["calc", "calc"],
  ["units", "units"],
  ["time", "time"],
  ["random", "random"],
  ["password", "password"],
  ["encoding", "encoding"],
  ["regex", "regex"],
];

const tpl = (dir, key) => `import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("${dir}", (m) => m.${key}.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
`;

for (const [dir, key] of routes) {
  const d = path.join(base, dir);
  fs.writeFileSync(path.join(d, "layout.tsx"), tpl(dir, key), "utf8");
}
console.log("wrote", routes.length, "layouts");
