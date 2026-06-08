"use client";

import { useState, useCallback } from "react";
import IntroSplash from "./IntroSplash";
import Navbar from "./Navbar";
import LenisProvider from "./LenisProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <>
      {!splashDone && <IntroSplash onComplete={handleSplashComplete} />}
      <Navbar visible={splashDone} />
      <LenisProvider />
      <div style={{
        opacity: splashDone ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}>
        {children}
      </div>
    </>
  );
}
