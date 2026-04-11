"use client";

import { useTranslations } from "next-intl";

type Props = {
  onRun: () => void | Promise<void>;
  /** Clears tool state, then runs the same action as Run (fresh attempt). */
  onResetAndRun?: () => void | Promise<void>;
  busy?: boolean;
  disabled?: boolean;
  runLabel?: string;
};

export function ToolRunActions({
  onRun,
  onResetAndRun,
  busy,
  disabled,
  runLabel,
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
        {busy ? tc("processing") : label}
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
