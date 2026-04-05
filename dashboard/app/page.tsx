"use client";

import { useState, useEffect } from "react";
import { Activity, Bug, Users, Terminal, Play, AlertTriangle, BarChart2 } from "lucide-react";
import Link from "next/link";

export default function OverviewPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ testsRun: 0, bugsFiled: 0, leadsToday: 0, uptime: "99.98%" });
  const [liveStatus, setLiveStatus] = useState<any>({});
  const [perf] = useState([40, 60, 45, 70, 55, 80, 65, 90, 75, 85, 92, 88, 95]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, l] = await Promise.all([fetch("/api/agent/status"), fetch("/api/stats")]);
        if (s.ok) { const d = await s.json(); setLogs(d.logs || []); setMetrics(p => ({ ...p, ...d.metrics })); }
        if (l.ok) setLiveStatus(await l.json());
      } catch { }
    };
    fetchData();
    const i = setInterval(fetchData, 3000);
    return () => clearInterval(i);
  }, []);

  const triggerAgent = async (id: string) => { try { await fetch("/api/agents/invoke", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agent: id }) }); } catch { } };

  const agents = [
    { id: "research", name: "Market Intel", desc: "Autonomous crawl & competitor mapping" },
    { id: "leads", name: "Opportunity Engine", desc: "CRM synapse & lead extraction" },
    { id: "qa", name: "Cluster Monitor", desc: "Regression, stability & uptime audit" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ fontSize: 14, color: "#525252", marginTop: 4 }}>System health, active compute nodes, and recent anomalies.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => triggerAgent("all")}>Run All Tasks</button>
          <button className="btn btn-danger">Terminate All</button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-tile">
          <div className="kpi-label">Uptime</div>
          <div className="kpi-value">{metrics.uptime}</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-label">Transactions</div>
          <div className="kpi-value">{metrics.testsRun}</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-label">Leads Ingested</div>
          <div className="kpi-value">{metrics.leadsToday}</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-label">Anomalies</div>
          <div className="kpi-value" style={{ color: metrics.bugsFiled > 0 ? "#da1e28" : undefined }}>{metrics.bugsFiled}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Compute Nodes Table */}
          <div className="card">
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Compute Nodes</span>
              <span className="tag tag-green">All Operational</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Status</th>
                  <th>Current Task</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => {
                  const status = liveStatus[a.id]?.status || "idle";
                  const task = liveStatus[a.id]?.task || "—";
                  const running = status === "running";
                  return (
                    <tr key={a.id}>
                      <td>
                        <Link href={`/agents/${a.id}`} style={{ color: "#0f62fe", fontWeight: 600, textDecoration: "none" }}>{a.name}</Link>
                        <div style={{ fontSize: 12, color: "#6f6f6f", marginTop: 2 }}>{a.desc}</div>
                      </td>
                      <td><span className={`tag ${running ? "tag-green" : "tag-gray"}`}>{status}</span></td>
                      <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#525252", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task}</td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn btn-primary" style={{ height: 32, fontSize: 13, padding: "0 12px" }} onClick={() => triggerAgent(a.id)} disabled={running}>
                          <Play size={14} fill="currentColor" /> Invoke
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Performance Chart */}
          <div className="card">
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><BarChart2 size={16} /> Throughput</span>
              <span style={{ fontSize: 12, color: "#525252", fontWeight: 400 }}>Last 24 hours</span>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}>
                {perf.map((v, i) => (
                  <div key={i} style={{ flex: 1, height: `${v}%`, background: "#c6c6c6", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#0f62fe")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#c6c6c6")} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#a8a8a8", marginTop: 8, fontFamily: "'IBM Plex Mono', monospace" }}>
                <span>00:00</span><span>12:00</span><span>Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Log Pane */}
        <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="card-header" style={{ background: "#262626", color: "#f4f4f4", borderColor: "#393939", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><Terminal size={14} /> System Traces</span>
            <span style={{ fontSize: 11, color: "#6f6f6f" }}>Live</span>
          </div>
          <div className="log-pane" style={{ flex: 1, padding: 16, maxHeight: "calc(100vh - 280px)" }}>
            {logs.length > 0 ? logs.map((log, i) => (
              <div key={i} style={{ marginBottom: 6, display: "flex", gap: 12 }}>
                <span style={{ color: "#6f6f6f", flexShrink: 0 }}>{log.time}</span>
                <span style={{ color: log.type === "err" ? "#ff8389" : log.type === "ok" ? "#42be65" : "#c6c6c6" }}>{log.text}</span>
              </div>
            )) : (
              <div style={{ color: "#6f6f6f", fontStyle: "italic" }}>Waiting for telemetry…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
