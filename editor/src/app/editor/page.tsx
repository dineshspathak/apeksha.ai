"use client";

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

export default function EditorPage() {
  return <EditorLayout />;
}
