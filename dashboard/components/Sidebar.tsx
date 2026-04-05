"use client";

import { usePathname } from "next/navigation";
import { Activity, Layers, Settings, Search, Users, Server, Database, ShieldAlert } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  const pathname = usePathname();

  const sections = [
    {
      label: "Operations",
      items: [
        { label: "Dashboard", href: "/", icon: Activity },
        { label: "QA Cluster", href: "/agents/qa", icon: ShieldAlert },
        { label: "Market Intel", href: "/agents/research", icon: Search },
        { label: "Leads Engine", href: "/agents/leads", icon: Users },
      ],
    },
    {
      label: "Infrastructure",
      items: [
        { label: "Fleet Provisioning", href: "/products", icon: Server },
        { label: "Telemetry", href: "/telemetry", icon: Database },
        { label: "Anomaly Tracker", href: "/bugs", icon: Layers },
        { label: "Settings", href: "/governance", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="shell-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#0f62fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 10, height: 10, background: "#fff", transform: "rotate(45deg)" }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" }}>EZ Agent Hub</div>
            <div style={{ fontSize: 11, color: "#6f6f6f", fontWeight: 500 }}>v2.4 · Management</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto" }}>
        {sections.map((section) => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#393939", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#c6c6c6" }}>
            A
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f4f4f4" }}>Administrator</div>
            <div style={{ fontSize: 11, color: "#6f6f6f", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#42be65" }} />
              Online
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
