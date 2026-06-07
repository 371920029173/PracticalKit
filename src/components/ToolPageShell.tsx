"use client";

import type { ReactNode } from "react";

type ToolPageShellProps = {
  title: string;
  note?: string;
  kicker?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ToolPageShell({
  title,
  note,
  kicker,
  actions,
  children,
  className = "",
}: ToolPageShellProps) {
  return (
    <article className={`tool-page stagger-fade ${className}`.trim()}>
      <header className="tool-page-header">
        {kicker ? <p className="section-kicker">{kicker}</p> : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="tool-h1">{title}</h1>
            {note ? <p className="tool-muted max-w-2xl">{note}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      </header>
      <div className="tool-page-body">{children}</div>
    </article>
  );
}

type ToolSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  pad?: boolean;
};

export function ToolSection({
  title,
  description,
  children,
  className = "",
  pad = true,
}: ToolSectionProps) {
  return (
    <section className={`tool-panel ${pad ? "tool-panel-pad" : ""} ${className}`.trim()}>
      {title || description ? (
        <div className="mb-4 space-y-1">
          {title ? <h2 className="tool-section-title">{title}</h2> : null}
          {description ? <p className="tool-section-desc">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

type ToolStatProps = {
  label: string;
  value: ReactNode;
  hint?: string;
};

export function ToolStatGrid({ items }: { items: ToolStatProps[] }) {
  return (
    <dl className="tool-stat-grid">
      {items.map((item) => (
        <div key={item.label} className="tool-stat">
          <dt className="tool-stat-label">{item.label}</dt>
          <dd className="tool-stat-value">{item.value}</dd>
          {item.hint ? <dd className="tool-stat-hint">{item.hint}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

export function ToolOutput({
  label,
  children,
  mono = true,
  className = "",
}: {
  label?: string;
  children: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {label ? <p className="tool-output-label">{label}</p> : null}
      <div className={mono ? "tool-pre-out" : "tool-panel tool-panel-pad text-sm"}>{children}</div>
    </div>
  );
}
