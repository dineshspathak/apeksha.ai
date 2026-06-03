import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apeksha AI Editor",
  description: "AI-powered code editor that runs locally",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-editor-bg text-editor-text overflow-hidden">
        {children}
      </body>
    </html>
  );
}
