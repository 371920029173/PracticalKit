"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/en/");
  }, [router]);
  return (
    <p className="p-6 text-sm text-zinc-400">Redirecting to English…</p>
  );
}
