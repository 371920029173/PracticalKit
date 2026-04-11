"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { useTranslations } from "next-intl";
import JSZip from "jszip";
import { Document, Packer, Paragraph, TextRun } from "docx";

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  return pdfjs;
}

function downloadBlob(
  data: Blob | Uint8Array,
  name: string,
  mime = "application/octet-stream"
) {
  const blob =
    data instanceof Blob
      ? data
      : new Blob([Uint8Array.from(data)], { type: mime });
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  URL.revokeObjectURL(u);
}

export default function PdfToolClient() {
  const t = useTranslations("pdf");
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState(false);
  const [mergePick, setMergePick] = useState<FileList | null>(null);
  const [splitPick, setSplitPick] = useState<File | undefined>();
  const [compressPick, setCompressPick] = useState<File | undefined>();
  const [toImgPick, setToImgPick] = useState<File | undefined>();
  const [toWordPick, setToWordPick] = useState<File | undefined>();

  async function merge(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setLog("");
    try {
      const out = await PDFDocument.create();
      for (const f of Array.from(files)) {
        const buf = await f.arrayBuffer();
        const src = await PDFDocument.load(buf);
        const idx = src.getPageIndices();
        const copied = await out.copyPages(src, idx);
        copied.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      downloadBlob(bytes, "merged.pdf", "application/pdf");
      setLog("merged.pdf");
    } catch (e) {
      setLog(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function split(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setLog("");
    try {
      const buf = await file.arrayBuffer();
      const src = await PDFDocument.load(buf);
      const zip = new JSZip();
      const n = src.getPageCount();
      for (let i = 0; i < n; i++) {
        const one = await PDFDocument.create();
        const [page] = await one.copyPages(src, [i]);
        one.addPage(page);
        const b = await one.save();
        zip.file(`page_${String(i + 1).padStart(3, "0")}.pdf`, b);
      }
      const zblob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zblob, "split_pages.zip");
      setLog(`zip with ${n} PDFs`);
    } catch (e) {
      setLog(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function compress(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setLog("");
    try {
      const buf = await file.arrayBuffer();
      const src = await PDFDocument.load(buf);
      const bytes = await src.save({ useObjectStreams: true });
      downloadBlob(bytes, "resaved.pdf", "application/pdf");
      setLog("resaved.pdf");
    } catch (e) {
      setLog(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function toImages(file: File | undefined, scale = 1.5) {
    if (!file) return;
    setBusy(true);
    setLog("");
    try {
      const { getDocument } = await loadPdfJs();
      const buf = await file.arrayBuffer();
      const pdf = await getDocument({ data: buf }).promise;
      const zip = new JSZip();
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob((b) => res(b), "image/png")
        );
        if (blob) zip.file(`page_${String(i).padStart(3, "0")}.png`, blob);
      }
      const zblob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zblob, "pages_png.zip");
      setLog(`png zip`);
    } catch (e) {
      setLog(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function toWord(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setLog("");
    try {
      const { getDocument } = await loadPdfJs();
      const buf = await file.arrayBuffer();
      const pdf = await getDocument({ data: buf }).promise;
      const paras: Paragraph[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        const line = tc.items
          .map((it) => ("str" in it ? it.str : ""))
          .join(" ");
        paras.push(new Paragraph({ children: [new TextRun(line || ` `)] }));
      }
      const doc = new Document({ sections: [{ children: paras }] });
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, "from-pdf.docx");
      setLog("from-pdf.docx");
    } catch (e) {
      setLog(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="tool-h1">{t("title")}</h1>
      {busy && <p className="text-sm text-amber-300">…</p>}
      <section className="space-y-2 rounded-xl border border-zinc-800 p-4">
        <h2 className="text-sm text-zinc-400">{t("merge")}</h2>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => setMergePick(e.target.files)}
        />
        <ToolRunActions
          onRun={() => void merge(mergePick)}
          onResetAndRun={() => {
            setMergePick(null);
            setLog("");
          }}
          busy={busy}
        />
        <p className="text-xs text-zinc-600">{t("mergeBtn")}</p>
      </section>
      <section className="space-y-2 rounded-xl border border-zinc-800 p-4">
        <h2 className="text-sm text-zinc-400">{t("split")}</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setSplitPick(e.target.files?.[0])}
        />
        <ToolRunActions
          onRun={() => void split(splitPick)}
          onResetAndRun={() => {
            setSplitPick(undefined);
            setLog("");
          }}
          busy={busy}
        />
      </section>
      <section className="space-y-2 rounded-xl border border-zinc-800 p-4">
        <h2 className="text-sm text-zinc-400">{t("compress")}</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setCompressPick(e.target.files?.[0])}
        />
        <ToolRunActions
          onRun={() => void compress(compressPick)}
          onResetAndRun={() => {
            setCompressPick(undefined);
            setLog("");
          }}
          busy={busy}
        />
      </section>
      <section className="space-y-2 rounded-xl border border-zinc-800 p-4">
        <h2 className="text-sm text-zinc-400">{t("toImages")}</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setToImgPick(e.target.files?.[0])}
        />
        <ToolRunActions
          onRun={() => void toImages(toImgPick)}
          onResetAndRun={() => {
            setToImgPick(undefined);
            setLog("");
          }}
          busy={busy}
        />
      </section>
      <section className="space-y-2 rounded-xl border border-zinc-800 p-4">
        <h2 className="text-sm text-zinc-400">{t("toWord")}</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setToWordPick(e.target.files?.[0])}
        />
        <ToolRunActions
          onRun={() => void toWord(toWordPick)}
          onResetAndRun={() => {
            setToWordPick(undefined);
            setLog("");
          }}
          busy={busy}
        />
      </section>
      <pre className="rounded border border-zinc-800 bg-black/40 p-2 text-xs text-zinc-300">{log}</pre>
    </div>
  );
}
