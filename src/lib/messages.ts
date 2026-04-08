import type en from "@/messages/en.json";

export type Messages = typeof en;

export async function loadMessages(locale: string): Promise<Messages> {
  switch (locale) {
    case "zh":
      return (await import("@/messages/zh.json")).default as Messages;
    case "ru":
      return (await import("@/messages/ru.json")).default as Messages;
    case "es":
      return (await import("@/messages/es.json")).default as Messages;
    default:
      return (await import("@/messages/en.json")).default;
  }
}
