import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "EZ Agent Hub — EZBillify Ventures",
  description: "Internal agent command center",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

function Sidebar() {
  const nav = [
    { label: "Overview", href: "/", color: "#534AB7" },
    { label: "QA Agent", href: "/agents/qa", color: "#1D9E75" },
    { label: "Research Agent", href: "/agents/research", color: "#7F77DD" },
    { label: "Lead Gen Agent", href: "/agents/leads", color: "#BA7517" },
    { label: "Products", href: "/products", color: "#888780" },
    { label: "Bug Reports", href: "/bugs", color: "#E24B4A" },
    { label: "Logs", href: "/logs", color: "#888780" },
    { label: "Settings", href: "/settings", color: "#888780" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-title">EZ Agent Hub</span>
        <span className="logo-sub">EZBillify Ventures</span>
      </div>
      <nav>
        {nav.map((item) => (
          <a key={item.href} href={item.href} className="nav-item">
            <span className="nav-dot" style={{ background: item.color }} />
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
