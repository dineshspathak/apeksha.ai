"use client";

import dynamic from "next/dynamic";

// Load landing page for all visitors on the hosted version
const LandingPage = dynamic(() => import("./landing/page"), { ssr: false });

export default function Home() {
  return <LandingPage />;
}
