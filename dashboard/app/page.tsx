"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Cpu, 
  Target, 
  Globe, 
  Activity, 
  ChevronRight, 
  History, 
  Search, 
  ShieldCheck, 
  Terminal,
  Waves,
  Database,
  ArrowRight,
  MonitorCheck
} from "lucide-react";

export default function Overview() {
  const [status, setStatus] = useState<any>({
    activeAgents: 0,
    technicalPulse: 0,
    marketCoverage: 0,
    logs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) setStatus(await res.json());
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  // PHASES for the "Research-to-Sales" Pipeline
  // PHASES derived from live agents
  const phases = [
    { id: "trigger", label: "Trigger", sub: "FastAPI Webhook", icon: Zap },
    { id: "ingest", label: "Ingestor", sub: "Repomix Flattening", icon: Database },
    { id: "analyze", label: "Analyst", sub: "Qwen 2.5 Coder", icon: Cpu },
    { id: "research", label: "Researcher", sub: "Llama 3 + Search", icon: Search },
    { id: "leads", label: "Handoff", sub: "Apify Lead Gen", icon: Target },
  ];

  return (
    <div className="animate-in fade-in duration-700" style={{ padding: "32px 40px" }}>
      {/* 🏙️ HEADER AREA */}
      <div style={{ marginBottom: 44 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          <MonitorCheck size={14} style={{ color: "var(--primary-enterprise)" }} />
          <span>EZ Agent Hub</span>
          <span style={{ opacity: 0.3 }}>/</span>
          <span style={{ color: "var(--primary-enterprise)" }}>Executive Oversight</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.04em" }}>System Operations Center</h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 8, maxWidth: 650 }}>
          Monitoring the global autonomous intelligence pipeline. High-precision technical analysis and automated market discovery loop.
        </p>
      </div>

      {/* 🌊 AUTONOMOUS RESEARCH-TO-SALES PIPELINE MAP */}
      <div className="card-enterprise" style={{ padding: 40, border: "none", background: "var(--surface-container-low)", marginBottom: 48, position: "relative", overflow: "hidden" }}>
        {/* Background Decorative Element */}
        <div style={{ position: "absolute", right: -50, top: -50, width: 300, height: 300, background: "radial-gradient(circle, var(--primary-enterprise) 10%, transparent 70%)", opacity: 0.03 }}></div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--primary-enterprise)", display: "flex", alignItems: "center", gap: 10 }}>
            <Activity size={16} /> Autonomous Research-To-Sales Execution Pipeline
          </h2>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", background: "rgba(0,0,0,0.04)", padding: "4px 12px", borderRadius: 20 }}>
            v2.4 ACTIVE MONITORING
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, position: "relative" }}>
          {/* Connector Line (n8n Style Heartbeat) */}
          <div style={{ position: "absolute", top: 26, left: "5%", right: "5%", height: 1, background: "rgba(0,0,0,0.05)", zIndex: 0 }}>
             {/* Data Pulse Ball */}
             <div style={{ 
               width: 6, height: 6, background: "var(--primary-enterprise)", borderRadius: "50%",
               position: "absolute", top: -2.5, left: 0,
               animation: "data-pulse-flow 4s infinite cubic-bezier(0.4, 0, 0.2, 1)",
               boxShadow: "0 0 8px var(--primary-enterprise)"
             }} />
          </div>
          
          {phases.map((p, i) => {
            const agentData = status?.agents?.find((a: any) => a.id === p.id);
            const agentStatus = agentData?.status || "idle";
            const isActive = agentStatus === "running";
            const isDone = agentStatus === "completed";
            const currentTask = agentData?.current_task;
            
            return (
              <div key={p.id} style={{ textAlign: "center", zIndex: 1, position: "relative" }}>
                <div style={{ 
                  width: 52, height: 52, borderRadius: "50%", margin: "0 auto 16px",
                  background: isDone ? "#10b981" : isActive ? "var(--primary-enterprise)" : "white",
                  border: isDone ? "4px solid #10b98120" : isActive ? "4px solid var(--primary-enterprise)20" : "1.5px solid var(--border-standard)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isDone || isActive ? "white" : "var(--text-muted)",
                  boxShadow: isActive ? "0 0 25px var(--primary-enterprise)40" : "none",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  animation: isActive ? "active-unit-pulse 2s infinite" : "none"
                }}>
                  <p.icon size={20} fill={isDone || isActive ? "white" : "none"} />
                  
                  {/* Status Indicator Dot */}
                  {isActive && (
                    <span style={{ 
                      position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", 
                      background: "#10b981", border: "2px solid white", boxShadow: "0 0 12px #10b981" 
                    }} className="animate-pulse" />
                  )}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)" }}>{p.label}</h3>
                <p style={{ 
                  fontSize: isActive ? 11 : 10, 
                  fontWeight: isActive ? 800 : 700, 
                  color: isActive ? "var(--primary-enterprise)" : "var(--text-muted)", 
                  marginTop: 6,
                  maxWidth: 160,
                  margin: "6px auto 0",
                  lineHeight: 1.3
                }}>
                  {isActive ? (currentTask || "PREPARING RUNTIME...") : isDone ? "COMPLETE" : p.sub}
                </p>
                
                {isActive && (
                   <div style={{ width: 40, height: 2, background: "var(--primary-enterprise)", margin: "8px auto 0", borderRadius: 2, overflow: "hidden" }}>
                     <div className="shimmer" style={{ width: "100%", height: "100%", animation: "progress-shimmer 1.5s infinite" }} />
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 📐 GRID: KPI & LOGS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 32 }}>
        
        {/* LEFT: LIVE TELEMETRY CARDS */}
        <div style={{ display: "grid", gap: 20 }}>
          <div className="card-enterprise" style={{ padding: 32, border: "none", background: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h4 style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 4 }}>TECHNICAL PULSE</h4>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--secondary)", letterSpacing: "-0.04em" }}>{status?.technicalPulse || 0}%</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#10b98115", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)" }}>
                <Waves size={24} />
              </div>
            </div>
            {/* Sparkline Visual */}
            <div style={{ height: 60, display: "flex", alignItems: "flex-end", gap: 6 }}>
              {[60, 45, 80, 50, 70, 95, 85, 99, 92, 98].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: "var(--secondary)", opacity: 0.1 + (i * 0.1), borderRadius: 2 }}></div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>
              <span>SYNC LATENCY: 0.2ms</span>
              <span>CLUSTER: MAC-MINI-01</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card-enterprise" style={{ padding: 24, border: "none", background: "white" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>Active Units</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{status?.activeAgents || 0}</div>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4, color: "var(--secondary)", fontSize: 11, fontWeight: 700 }}>
                <Zap size={12} fill="currentColor" /> +2 Registered Today
              </div>
            </div>
            <div className="card-enterprise" style={{ padding: 24, border: "none", background: "white" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>Market Access</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{status?.marketCoverage || 0}%</div>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4, color: "var(--primary-enterprise)", fontSize: 11, fontWeight: 700 }}>
                <Globe size={12} /> Global Discovery Active
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE ARCHITECT LOGS */}
        <div className="card-enterprise" style={{ padding: 0, border: "none", background: "#0f172a", borderRadius: 24, overflow: "hidden", color: "#94a3b8", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}>
          <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Terminal size={18} color="var(--primary-enterprise)" />
              <h4 style={{ fontSize: 13, fontWeight: 800, color: "white", letterSpacing: "0.02em" }}>Analytical Slave Logs</h4>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }}></div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }}></div>
            </div>
          </div>
          
          <div style={{ padding: 32, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 13, minHeight: 400, overflowY: "auto", maxHeight: 500 }}>
            {status?.logs?.slice(-8).map((log: any, i: number) => (
              <div key={i} style={{ marginBottom: 16, display: "flex", gap: 16 }}>
                <span style={{ opacity: 0.3, flexShrink: 0 }}>[{log.time}]</span>
                <span style={{ 
                   color: log.type === "err" ? "#ef4444" : log.type === "success" ? "#4ade80" : "#60a5fa",
                   fontWeight: 800,
                   flexShrink: 0
                }}>{log.type?.toUpperCase()}:</span>
                <span style={{ color: "rgba(255,255,255,0.9)" }}>{log.text}</span>
              </div>
            ))}
            <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <span className="animate-pulse" style={{ width: 8, height: 16, background: "var(--primary-enterprise)" }}></span>
              <span style={{ fontSize: 12, opacity: 0.5 }}>awaiting next-cycle telemetry...</span>
            </div>
          </div>

          <div style={{ padding: "20px 32px", background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button style={{ background: "transparent", border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              Open Full Cluster Console <ArrowRight size={14} />
            </button>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--primary-enterprise)" }}>OLLAMA CLUSTER 01</span>
          </div>
        </div>

      </div>

      {/* 🚀 QUICK ACTION RAIL */}
      <div style={{ marginTop: 48, display: "flex", gap: 16 }}>
        <a href="/products" style={{ flex: 1, textDecoration: "none" }}>
          <div className="card-enterprise" style={{ padding: 24, background: "white", display: "flex", alignItems: "center", gap: 20, border: "2px dashed var(--border-standard)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--surface-container-low)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-enterprise)" }}>
              <Plus size={24} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>Deploy New Autonomous Worker</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Register GitHub Repository & Begin Ingest</div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

function Plus({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
