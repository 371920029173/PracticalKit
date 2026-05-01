export default function LocaleLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/55 backdrop-blur-md dark:bg-zinc-950/55">
      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-700/70 dark:bg-zinc-900/60">
        <div className="loader-row" aria-hidden>
          {Array.from({ length: 6 }).map((_, idx) => (
            <span
              key={idx}
              className="loader-dot"
              style={{ animationDelay: `${idx * 90}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
