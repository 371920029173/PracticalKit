"use client";

import { useTranslations } from "next-intl";

type Props = {
  onRun: () => void | Promise<void>;
  /** Clears tool state, then runs the same action as Run (fresh attempt). */
  onResetAndRun?: () => void | Promise<void>;
  busy?: boolean;
  disabled?: boolean;
  runLabel?: string;
  showNewBadge?: boolean;
};

export function ToolRunActions({
  onRun,
  onResetAndRun,
  busy,
  disabled,
  runLabel,
  showNewBadge = true,
}: Props) {
  const tc = useTranslations("common");
  const label = runLabel ?? tc("run");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="btn-primary min-h-[2.5rem] min-w-[5.5rem]"
        disabled={busy || disabled}
        onClick={() => void onRun()}
      >
        <span className="inline-flex items-center gap-2">
          {busy ? tc("processing") : label}
          {showNewBadge ? <span className="badge-new">{tc("new")}</span> : null}
        </span>
      </button>
      {onResetAndRun ? (
        <button
          type="button"
          className="btn-ghost min-h-[2.5rem] text-sm"
          disabled={busy || disabled}
          onClick={() => void onResetAndRun()}
        >
          {tc("resetAndRun")}
        </button>
      ) : null}
    </div>
  );
}
