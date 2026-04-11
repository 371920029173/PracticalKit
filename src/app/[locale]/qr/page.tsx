"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import jsQR from "jsqr";

export default function QrPage() {
  const t = useTranslations("qr");
  const [text, setText] = useState("https://example.com");
  const [dataUrl, setDataUrl] = useState("");
  const [decodeOut, setDecodeOut] = useState("");

  async function gen() {
    const url = await QRCode.toDataURL(text, { margin: 1, width: 256 });
    setDataUrl(url);
  }

  async function onDecodeFile(f: File) {
    const bmp = await createImageBitmap(f);
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bmp, 0, 0);
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(data, width, height);
    setDecodeOut(code?.data || "(no QR found)");
  }

  return (
    <div className="space-y-6">
      <h1 className="tool-h1">{t("title")}</h1>
      <section className="space-y-2">
        <h2 className="text-sm text-zinc-500">{t("gen")}</h2>
        <textarea
          className="min-h-24 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="button"
          onClick={gen}
          className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900"
        >
          Generate
        </button>
        {dataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="qr" className="mt-2 max-w-xs border border-zinc-800 bg-white p-2" />
        )}
      </section>
      <section className="space-y-2">
        <h2 className="text-sm text-zinc-500">{t("scan")}</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onDecodeFile(f);
          }}
          className="text-sm"
        />
        <pre className="rounded border border-zinc-800 bg-black/40 p-2 text-sm">{decodeOut}</pre>
      </section>
    </div>
  );
}
