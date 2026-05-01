import type en from "@/messages/en.json";

export type Messages = typeof en;

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  patch: Partial<T>,
): T {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      out[k] &&
      typeof out[k] === "object" &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMerge(
        out[k] as Record<string, unknown>,
        v as Record<string, unknown>,
      );
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}

export async function loadMessages(locale: string): Promise<Messages> {
  switch (locale) {
    case "zh":
      return (await import("@/messages/zh.json")).default as Messages;
    case "ru":
      return (await import("@/messages/ru.json")).default as Messages;
    case "es":
      return (await import("@/messages/es.json")).default as Messages;
    case "fr":
      return deepMerge(
        (await import("@/messages/en.json")).default as Messages,
        (await import("@/messages/fr.json")).default as Partial<Messages>,
      );
    default:
      return (await import("@/messages/en.json")).default;
  }
}
