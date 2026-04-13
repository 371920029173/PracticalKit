"use client";

import { useMemo, useState } from "react";

function isExpandable(v: unknown): boolean {
  return v !== null && typeof v === "object";
}

function childPath(parent: string, key: string, isIndex: boolean): string {
  if (!parent) {
    return isIndex ? `[${key}]` : key;
  }
  return isIndex ? `${parent}[${key}]` : `${parent}.${key}`;
}

function TreeRow({
  label,
  value,
  path,
  depth,
  onPickPath,
}: {
  label: string;
  value: unknown;
  path: string;
  depth: number;
  onPickPath: (p: string) => void;
}) {
  const expandable = isExpandable(value);
  const [open, setOpen] = useState(depth < 2);

  const preview =
    value === null
      ? "null"
      : Array.isArray(value)
        ? `Array(${value.length})`
        : typeof value === "object"
          ? "Object"
          : typeof value === "string"
            ? JSON.stringify(value)
            : String(value);

  return (
    <div className="select-none font-mono text-xs">
      <div
        className="flex flex-wrap items-baseline gap-1 border-l border-slate-200 py-0.5 pl-2 dark:border-zinc-700"
        style={{ marginLeft: depth * 12 }}
      >
        {expandable ? (
          <button
            type="button"
            className="w-4 shrink-0 text-left text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-200"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? "▼" : "▶"}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <button
          type="button"
          className="text-left text-indigo-600 hover:underline dark:text-indigo-400"
          onClick={() => onPickPath(path)}
          title={path || "(root)"}
        >
          {label}
        </button>
        <span className="text-slate-500 dark:text-zinc-500">{expandable ? preview : `= ${preview}`}</span>
      </div>
      {expandable && open ? (
        <div>
          {Array.isArray(value)
            ? value.map((item, i) => (
                <TreeRow
                  key={`${path}[${i}]`}
                  label={`[${i}]`}
                  value={item}
                  path={childPath(path, String(i), true)}
                  depth={depth + 1}
                  onPickPath={onPickPath}
                />
              ))
            : Object.keys(value as Record<string, unknown>).map((k) => (
                <TreeRow
                  key={`${path}.${k}`}
                  label={k}
                  value={(value as Record<string, unknown>)[k]}
                  path={childPath(path, k, false)}
                  depth={depth + 1}
                  onPickPath={onPickPath}
                />
              ))}
        </div>
      ) : null}
    </div>
  );
}

function countNodes(v: unknown, limit: number): number {
  if (limit <= 0) return limit;
  let n = 1;
  if (v !== null && typeof v === "object") {
    if (Array.isArray(v)) {
      for (const item of v) {
        n += countNodes(item, limit - n);
        if (n >= limit) return n;
      }
    } else {
      for (const k of Object.keys(v as Record<string, unknown>)) {
        n += countNodes((v as Record<string, unknown>)[k], limit - n);
        if (n >= limit) return n;
      }
    }
  }
  return n;
}

type Props = {
  data: unknown;
  onPickPath: (path: string) => void;
  emptyLabel: string;
  tooLargeLabel: string;
};

const NODE_MAX = 4000;

export function DataTreeView({ data, onPickPath, emptyLabel, tooLargeLabel }: Props) {
  const total = useMemo(() => countNodes(data, NODE_MAX + 1), [data]);

  if (data === undefined) {
    return <p className="text-xs text-slate-500 dark:text-zinc-500">{emptyLabel}</p>;
  }

  if (total > NODE_MAX) {
    return <p className="text-xs text-amber-800 dark:text-amber-200">{tooLargeLabel}</p>;
  }

  return (
    <div className="max-h-80 overflow-auto rounded border border-slate-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-950">
      <TreeRow label="root" value={data} path="" depth={0} onPickPath={onPickPath} />
    </div>
  );
}
