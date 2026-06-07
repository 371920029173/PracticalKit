"use client";

import { ToolPageShell, ToolSection, ToolOutput } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useState } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import jsQR from "jsqr";

const DEF_QR_TEXT = "https://practicalkithub.com/zh/";

export default function QrPage() {
  const t = useTranslations("qr");
  const tc = useTranslations("common");
  const [text, setText] = useState(DEF_QR_TEXT);
  const [size, setSize] = useState(320);
  const [dataUrl, setDataUrl] = useState("");
  const [decodeOut, setDecodeOut] = useState("");
  const [scanFile, setScanFile] = useState<File | null>(null);

  async function gen() {
    try {
      const url = await QRCode.toDataURL(text.trim(), { margin: 1, width: size });
      setDataUrl(url);
    } catch (e) {
      setDecodeOut(String(e));
    }
  }

  async function onDecodeFile(f: File) {
    try {
      const bmp = await createImageBitmap(f);
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data, width, height);
      setDecodeOut(code?.data || t("noQr"));
    } catch (e) {
      setDecodeOut(String(e));
    }
  }

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <ToolSection title={t("gen")}>
        <textarea className="tool-textarea min-h-24" value={text} onChange={(e) => setText(e.target.value)} />
        <label className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-zinc-300">
          <span>{t("size")}</span>
          <select className="tool-select w-auto" value={size} onChange={(e) => setSize(Number(e.target.value))}>
            <option value={256}>256px</option>
            <option value={320}>320px</option>
            <option value={512}>512px</option>
          </select>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <ToolRunActions
            onRun={() => void gen()}
            onResetAndRun={() => {
              setText(DEF_QR_TEXT);
              setSize(320);
              void QRCode.toDataURL(DEF_QR_TEXT, { margin: 1, width: 320 }).then(setDataUrl);
            }}
          />
          {dataUrl ? (
            <a className="btn-ghost text-sm" href={dataUrl} download="qrcode.png">
              {tc("download")}
            </a>
          ) : null}
        </div>
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR" className="mt-4 max-w-xs rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-700" />
        ) : null}
      </ToolSection>

      <ToolSection title={t("scan")}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setScanFile(e.target.files?.[0] ?? null);
            setDecodeOut("");
          }}
          className="tool-field w-full max-w-md text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
        <div className="mt-3">
          <ToolRunActions
            onRun={() => {
              if (scanFile) void onDecodeFile(scanFile);
            }}
            onResetAndRun={() => {
              setScanFile(null);
              setDecodeOut("");
            }}
          />
        </div>
        <ToolOutput className="mt-4">{decodeOut || "—"}</ToolOutput>
      </ToolSection>
    </ToolPageShell>
  );
}
