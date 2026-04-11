"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useState } from "react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const defaultMd = `# Demo

- **bold** and *italic*
- [link](https://example.com)

\`\`\`js
console.log("hi");
\`\`\`
`;

export default function MarkdownPage() {
  const t = useTranslations("markdown");
  const [src, setSrc] = useState(defaultMd);
  const [renderKey, setRenderKey] = useState(0);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <ToolRunActions
        onRun={() => setRenderKey((k) => k + 1)}
        onResetAndRun={() => {
          setSrc(defaultMd);
          setRenderKey((k) => k + 1);
        }}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          className="min-h-[420px] w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
        />
        <div
          key={renderKey}
          className="markdown-body prose prose-invert max-w-none rounded-md border border-zinc-800 bg-zinc-900/40 p-4 prose-pre:bg-zinc-950"
        >
          <h2 className="mb-2 text-sm uppercase tracking-wide text-zinc-500">
            {t("preview")}
          </h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{src}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
