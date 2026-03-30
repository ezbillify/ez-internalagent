"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Terminal, 
  Cpu, 
  History, 
  Clock, 
  Server, 
  Database,
  CpuIcon,
  Search,
  Users,
  Zap,
  BarChart3,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";

export default function TelemetryPage() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [mounted, setMounted] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/stats"); 
        const data = await res.json();
        setTelemetry(data);
      } catch (err) {
        console.error("Telemetry out of sync", err);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && logRef.current) {
       logRef.current.scrollTop = logRef.current.scrollHeight; 
    }
  }, [telemetry?.logs, autoScroll]);

  const handleScroll = (e: any) => {
    const bottom = Math.abs(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight) < 1;
    setAutoScroll(bottom);
  };

  const filteredLogs = telemetry?.logs?.filter((l: any) => {
    if (filter === "all") return true;
    return l.text.toLowerCase().includes(filter.toLowerCase()) || l.type === filter;
  }) || [];

  return (
    <div className="animate-in fade-in duration-500">
      <header className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Enterprise Telemetry & Logs</h1>
          <p style={{ fontSize: 13, color: "var(--slate-muted)", marginTop: 4 }}>Real-time heartbeat and resource diagnostics for autonomous agent units</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="badge badge-success" style={{ padding: "8px 12px", display: "flex", gap: 8, alignItems: "center" }}>
            <span className="animate-pulse" style={{ width: 8, height: 8, background: "currentColor", borderRadius: "50%" }} />
            SYSTEMS: NOMINAL
          </div>
        </div>
      </header>

      {/* Real-time Diagnostics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 32 }}>
        
        {/* Active LLM Cluster Card (RAM) */}
        <div className="card-enterprise" style={{ padding: 24, borderTop: "4px solid #3b82f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
               <Cpu size={18} color="#3b82f6" />
               <span style={{ fontWeight: 800, fontSize: 14 }}>Cognitive Stack (RAM)</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--slate-muted)" }}>LIVE LLM UNITS</span>
          </div>
          {telemetry?.llm_stack?.length > 0 ? (
            telemetry.llm_stack.map((m: any, i: number) => (
              <div key={i} style={{ padding: "12px 16px", background: "var(--bg-enterprise)", borderRadius: 10, border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                   <span style={{ fontSize: 13, fontWeight: 700, color: "var(--slate-strong)" }}>{m.name}</span>
                   <span style={{ fontSize: 11, color: "var(--slate-muted)", display: "block" }}>{m.status}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#3b82f6" }}>{m.size}</span>
              </div>
            ))
          ) : (
            <div style={{ padding: 16, textAlign: "center", background: "var(--bg-enterprise)", borderRadius: 10 }}>
              <p style={{ fontSize: 11, color: "var(--slate-muted)", fontWeight: 700 }}>LLM IDLE (No units in RAM)</p>
            </div>
          )}
        </div>

        {/* Global Inventory Card (DISK) */}
        <div className="card-enterprise" style={{ padding: 24, borderTop: "4px solid #6366f1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
               <Server size={18} color="#6366f1" />
               <span style={{ fontWeight: 800, fontSize: 14 }}>AI Inventory (DISK)</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--slate-muted)" }}>{telemetry?.inventory?.length || 0} DOWNLOADED</span>
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {telemetry?.inventory?.length > 0 ? (
                telemetry.inventory.map((m: any, i: number) => (
                <div key={i} style={{ padding: "8px 12px", background: "var(--bg-enterprise)", borderRadius: 10, border: "1px dotted var(--border-subtle)", textAlign: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate-strong)", display: "block" }}>{m.name}</span>
                    <span style={{ fontSize: 9, color: "var(--slate-muted)", display: "block" }}>READY</span>
                </div>
                ))
            ) : (
                <div style={{ gridColumn: "span 2", padding: 16, textAlign: "center", background: "var(--bg-enterprise)", borderRadius: 10 }}>
                  <p style={{ fontSize: 11, color: "var(--slate-muted)", fontWeight: 700 }}>No models found on system</p>
                </div>
            )}
          </div>
        </div>

        {/* Global Resource Utilization */}
        <div className="card-enterprise" style={{ padding: 24, borderTop: "4px solid #166534" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
               <BarChart3 size={18} color="#166534" />
               <span style={{ fontWeight: 800, fontSize: 14 }}>Heartbeat Load Distribution</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--slate-muted)" }}>INSTANT %</span>
          </div>
          {telemetry?.agent_activity?.map((a: any, i: number) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{a.unit}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: a.load > 0 ? "#166534" : "var(--slate-muted)" }}>{a.load}%</span>
              </div>
              <div style={{ height: 3, background: "var(--bg-enterprise)", borderRadius: 2, overflow: "hidden" }}>
                 <div style={{ height: "100%", width: `${a.load}%`, background: a.load > 80 ? "#ef4444" : "#166534", transition: "width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 LOG SECTION CONTROLS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {["all", "RESEARCH", "LEADS", "QA", "err"].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                background: filter === cat ? "var(--primary-enterprise)" : "white",
                color: filter === cat ? "white" : "var(--text-muted)",
                border: "1.5px solid var(--border-standard)", cursor: "pointer", transition: "0.2s"
              }}
            >
              {cat === "err" ? "Critical Issues" : cat}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: autoScroll ? "#10b981" : "#f59e0b" }}></div>
            {autoScroll ? "AUTO-SYNC ACTIVE" : "SCROLL PAUSED"}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
        {/* Terminal Style Logs */}
        <div className="card-enterprise" style={{ padding: 0, overflow: "hidden", border: "none", background: "#0c111b", boxShadow: "0 25px 50px rgba(0,0,0,0.2)", borderRadius: 16 }}>
          <div style={{ padding: "16px 24px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Terminal size={14} color="var(--primary-enterprise)" />
              <span style={{ fontSize: 11, fontWeight: 800, color: "white", letterSpacing: "0.05em" }}>COGNITIVE_LOGS_HUB_v2.5</span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
               <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>BUFFER: {filteredLogs.length} EVENTS</span>
               {!autoScroll && <button onClick={() => setAutoScroll(true)} style={{ background: "var(--primary-enterprise)", border: "none", color: "white", fontSize: 9, fontWeight: 800, padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}>RESUME SYNC</button>}
            </div>
          </div>
          
          <div 
            ref={logRef}
            onScroll={handleScroll}
            style={{ 
              height: 600, 
              overflowY: "auto", 
              padding: 32, 
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 13,
              lineHeight: 2,
              color: "rgba(255,255,255,0.7)"
            }}
          >
            {filteredLogs.length > 0 ? filteredLogs.map((log: any, i: number) => {
              const [agent, ...msgParts] = log.text.split(':');
              const hasAgent = msgParts.length > 0 && agent.length < 20;
              
              return (
                <div key={i} style={{ 
                  marginBottom: 12, display: "grid", gridTemplateColumns: "100px 100px 1fr", gap: 24, 
                  borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 12 
                }}>
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>{log.time}</span>
                  <span style={{ 
                    color: log.type === "err" ? "#ef4444" : "#60a5fa", 
                    fontWeight: 800, fontSize: 11, transform: "scale(0.9)"
                  }}>[{log.type?.toUpperCase()}]</span>
                  <div>
                    {hasAgent && <span style={{ color: "#fbbf24", fontWeight: 800, marginRight: 12 }}>{agent}</span>}
                    <span style={{ color: log.type === "err" ? "#fca5a5" : "inherit" }}>
                        {hasAgent ? msgParts.join(':') : log.text}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: "center", padding: "100px 0", opacity: 0.3 }}>
                <Terminal size={48} style={{ margin: "0 auto 20px" }} />
                <p style={{ fontWeight: 800, letterSpacing: "0.1em" }}>NO EVENTS FOUND IN BUFFER</p>
              </div>
            )}
            
            {autoScroll && (
              <div style={{ marginTop: 24, display: "flex", gap: 24, opacity: 0.4 }}>
                 <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>{mounted ? new Date().toLocaleTimeString().slice(0, 5) : "--:--"}</span>
                 <span style={{ color: "#10b981", fontWeight: 800, fontSize: 11 }}>SYNC</span>
                 <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Awaiting operational event heartbeat...
                    <span className="animate-pulse inline-block w-2 h-4" style={{ background: "var(--primary-enterprise)", marginLeft: 8 }} />
                 </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
