"use client";

import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Search, 
  Users, 
  Layers, 
  AlertTriangle, 
  ScrollText, 
  Settings,
  Github,
  MonitorCheck,
  ChevronRight
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const nav = [
    { label: "Executive Overview", href: "/", icon: LayoutDashboard },
    { label: "Agent Fleet (QA)", href: "/agents/qa", icon: ShieldCheck },
    { label: "Market Research", href: "/agents/research", icon: Search },
    { label: "Opportunity Engine", href: "/agents/leads", icon: Users },
  ];

  const tools = [
    { label: "Fleet Monitor", href: "/products", icon: MonitorCheck },
    { label: "Analytical Logs", href: "/telemetry", icon: ScrollText },
    { label: "Issue Tracker", href: "/bugs", icon: AlertTriangle },
    { label: "Governance Hub", href: "/governance", icon: Settings },
  ];

  const NavItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href;
    return (
      <a 
        key={item.label} 
        href={item.href || '#'} 
        className={`nav-item ${isActive ? 'active' : ''}`}
        style={{ 
          margin: '0 12px 2px',
          borderRadius: 4,
          transition: 'all 0.15s ease'
        }}
      >
        <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
        <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
        {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
      </a>
    );
  };

  return (
    <aside className="sidebar" style={{ 
      background: "var(--glass-bg)", 
      backdropFilter: "blur(20px)",
      borderRight: "1px solid var(--border-subtle)",
      boxShadow: "10px 0 30px rgba(0,0,0,0.02)"
    }}>
      {/* 🚀 ADMINISTRATIVE CLUSTER BRAND */}
      <div className="sidebar-brand" style={{ padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--primary-enterprise)", boxShadow: "0 0 10px var(--primary-enterprise)" }}></div>
          <h1 className="brand-title" style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-main)" }}>EZ Hub Oversight</h1>
        </div>
        <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", opacity: 0.6, marginLeft: 20 }}>ADMINISTRATIVE CLUSTER V2.4</div>
      </div>

      <nav style={{ flex: 1, paddingTop: 12 }}>
        <div className="nav-group" style={{ marginBottom: 32 }}>
          <p className="nav-label" style={{ padding: "0 24px", fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Core Operations</p>
          {nav.map((item) => <NavItem key={item.label} item={item} />)}
        </div>

        <div className="nav-group">
          <p className="nav-label" style={{ padding: "0 24px", fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Infrastructure</p>
          {tools.map((item) => <NavItem key={item.label} item={item} />)}
        </div>
      </nav>

      {/* 🔐 CORPORATE AUTHENTICATION */}
      <div style={{ padding: "24px", marginTop: "auto", borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px", background: "white", borderRadius: 12, boxShadow: "var(--shadow-ambient)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Github size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: "var(--text-main)" }}>CORPORATE GATE</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }}></div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#10b981" }}>SECURE-HANDSHAKE</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
