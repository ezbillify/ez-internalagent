"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Cpu, Server, BarChart2 } from "lucide-react";

export default function TelemetryPage() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try { const r = await fetch("/api/stats"); if (r.ok) setTelemetry(await r.json()); } catch { }
    };
    fetch_(); const i = setInterval(fetch_, 2500); return () => clearInterval(i);
  }, []);

  useEffect(() => { if (autoScroll && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [telemetry, autoScroll]);

  const filteredLogs = (telemetry?.logs || []).filter((l: any) => filter === "all" || l.text?.toLowerCase().includes(filter.toLowerCase()) || l.type === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Telemetry</h1>
          <p style={{ fontSize: 14, color: "#525252", marginTop: 4 }}>Real-time diagnostics and resource monitoring.</p>
        </div>
        <span className="tag tag-green" style={{ padding: "4px 12px" }}>Systems Nominal</span>
      </div>

      {/* Diagnostics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#e0e0e0", border: "1px solid #e0e0e0", marginBottom: 24 }}>
        <div style={{ background: "#fff", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Cpu size={16} color="#0f62fe" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Cognitive Stack (RAM)</span>
          </div>
          {(telemetry?.llm_stack || []).length > 0 ? telemetry.llm_stack.map((m: any, i: number) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e0e0e0", fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{m.name}</span>
              <span style={{ color: "#0f62fe", fontWeight: 600, fontSize: 12 }}>{m.size}</span>
            </div>
          )) : <div style={{ fontSize: 12, color: "#6f6f6f" }}>No LLM units in RAM</div>}
        </div>
        <div style={{ background: "#fff", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Server size={16} color="#6366f1" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>AI Inventory (Disk)</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#6f6f6f" }}>{telemetry?.inventory?.length || 0} models</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(telemetry?.inventory || []).slice(0, 6).map((m: any, i: number) => (
              <div key={i} style={{ padding: "6px 10px", background: "#fafafa", border: "1px solid #e0e0e0", fontSize: 11, fontWeight: 500, textAlign: "center" }}>{m.name}</div>
            ))}
          </div>
        </div>
        <div style={{ background: "#fff", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <BarChart2 size={16} color="#198038" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Load Distribution</span>
          </div>
          {(telemetry?.agent_activity || []).map((a: any, i: number) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{a.unit}</span>
                <span style={{ color: a.load > 0 ? "#198038" : "#6f6f6f", fontWeight: 600 }}>{a.load}%</span>
              </div>
              <div style={{ height: 4, background: "#e0e0e0" }}>
                <div style={{ height: "100%", width: `${a.load}%`, background: a.load > 80 ? "#da1e28" : "#198038", transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "RESEARCH", "LEADS", "QA", "err"].map(cat => (
            <button key={cat} className={`btn ${filter === cat ? "btn-primary" : "btn-secondary"}`}
              style={{ height: 32, fontSize: 12, padding: "0 12px" }}
              onClick={() => setFilter(cat)}>
              {cat === "err" ? "Errors Only" : cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#6f6f6f", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: autoScroll ? "#42be65" : "#f1c21b" }} />
          {autoScroll ? "Auto-scroll active" : "Scroll paused"}
        </div>
      </div>

      {/* Log Terminal */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header" style={{ background: "#262626", color: "#f4f4f4", borderColor: "#393939", display: "flex", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><Terminal size={14} /> Event Stream</span>
          <span style={{ fontSize: 11, color: "#6f6f6f" }}>{filteredLogs.length} events</span>
        </div>
        <div ref={logRef} className="log-pane" style={{ height: 500, padding: 24 }}
          onScroll={(e: any) => setAutoScroll(Math.abs(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight) < 1)}>
          {filteredLogs.length > 0 ? filteredLogs.map((log: any, i: number) => (
            <div key={i} style={{ marginBottom: 6, display: "grid", gridTemplateColumns: "80px 60px 1fr", gap: 16 }}>
              <span style={{ color: "#6f6f6f", fontSize: 11 }}>{log.time}</span>
              <span style={{ color: log.type === "err" ? "#ff8389" : "#0f62fe", fontWeight: 600, fontSize: 11 }}>[{log.type?.toUpperCase()}]</span>
              <span style={{ color: log.type === "err" ? "#ffb3b8" : "#c6c6c6" }}>{log.text}</span>
            </div>
          )) : <div style={{ textAlign: "center", padding: 80, color: "#6f6f6f" }}>No events in buffer</div>}
        </div>
      </div>
    </div>
  );
}
