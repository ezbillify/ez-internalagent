"use client";

import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";
import { Sidebar } from "../components/Sidebar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layers } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const isOnboarding = pathname === "/onboarding";

  useEffect(() => {
    if (isOnboarding) { setChecking(false); return; }
    const checkFleet = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (!data.products || data.products.length === 0) { router.push("/onboarding"); }
        }
      } catch (e) { console.error("Fleet check failed", e); } finally { setChecking(false); }
    };
    checkFleet();
  }, [pathname, router, isOnboarding]);

  if (checking) {
    return (
      <html lang="en" className={inter.variable}>
        <body>
          <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f4f4f4" }}>
            <p style={{ fontSize: 14, color: "#525252" }}>Loading workspace…</p>
          </div>
        </body>
      </html>
    );
  }

  if (isOnboarding) {
    return (
      <html lang="en" className={inter.variable}>
        <body>{children}<Toaster position="bottom-right" /></body>
      </html>
    );
  }

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="shell-main">
            <header className="shell-topbar">
              <Layers size={16} style={{ marginRight: 8, opacity: 0.7 }} />
              EZ Hub · Management Console
            </header>
            <main className="shell-page">
              {children}
            </main>
          </div>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
