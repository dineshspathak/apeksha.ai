"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const EditorLayout = dynamic(
  () => import("@/components/EditorLayout").then((m) => ({ default: m.EditorLayout })),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <p className="text-4xl mb-4"></p>
          <p className="text-gray-400">Loading Apeksha Editor...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const [isLocal, setIsLocal] = useState<boolean | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    setIsLocal(hostname === "localhost" || hostname === "127.0.0.1");
  }, []);

  // Still detecting
  if (isLocal === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <p className="text-4xl mb-4"></p>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Local = show editor
  if (isLocal) {
    return <EditorLayout />;
  }

  // Production = redirect to landing page
  if (typeof window !== "undefined") {
    window.location.href = "/landing";
  }
  return null;
}
