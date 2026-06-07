/**
 * Wrap legacy tool pages in ToolPageShell.
 * Run: node scripts/upgrade-tool-pages.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, "../src/app/[locale]");

const SKIP = new Set([
  "pdf",
  "rgbv3d",
  "qr",
  "hash",
  "percent",
  "bmi",
  "mushroom-quiz",
  "ip-lookup",
  "money",
  "translate",
  "dns-lookup",
]);

const segments = fs
  .readdirSync(appDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((s) => !SKIP.has(s) && fs.existsSync(path.join(appDir, s, "page.tsx")));

let updated = 0;
let skipped = 0;

for (const seg of segments) {
  const file = path.join(appDir, seg, "page.tsx");
  let c = fs.readFileSync(file, "utf8");

  if (c.includes("ToolPageShell")) {
    skipped++;
    continue;
  }

  if (!/<div className="space-y-4">/.test(c) || !/<h1 className="tool-h1">/.test(c)) {
    skipped++;
    continue;
  }

  const h1Match = c.match(/<h1 className="tool-h1">\{([^}]+)\}<\/h1>/);
  if (!h1Match) {
    skipped++;
    continue;
  }
  const titleExpr = h1Match[1];

  const noteMatch = c.match(
    /<h1 className="tool-h1">\{[^}]+\}<\/h1>\s*\n\s*<p className="tool-muted">\{([^}]+)\}<\/p>/,
  );
  const noteExpr = noteMatch?.[1];

  if (!c.includes('from "@/components/ToolPageShell"')) {
    const importAnchor = c.match(/^("use client";\s*\n)/);
    if (importAnchor) {
      c = c.replace(
        importAnchor[0],
        `${importAnchor[0]}import { ToolPageShell } from "@/components/ToolPageShell";\n`,
      );
    } else {
      c = `import { ToolPageShell } from "@/components/ToolPageShell";\n${c}`;
    }
  }

  const shellOpen = noteExpr
    ? `<ToolPageShell title={${titleExpr}} note={${noteExpr}}>`
    : `<ToolPageShell title={${titleExpr}}>`;

  c = c.replace(/<div className="space-y-4">/, shellOpen);
  c = c.replace(
    /<h1 className="tool-h1">\{[^}]+\}<\/h1>\s*\n\s*(<p className="tool-muted">\{[^}]+\}<\/p>\s*\n\s*)?/,
    "",
  );

  const marker = "    </div>\n  );";
  const idx = c.lastIndexOf(marker);
  if (idx === -1) {
    console.warn(`Could not close shell: ${seg}`);
    skipped++;
    continue;
  }
  c = `${c.slice(0, idx)}    </ToolPageShell>\n  );${c.slice(idx + marker.length)}`;

  fs.writeFileSync(file, c);
  updated++;
  console.log(`upgraded: ${seg}`);
}

console.log(`Done. updated=${updated} skipped=${skipped}`);
