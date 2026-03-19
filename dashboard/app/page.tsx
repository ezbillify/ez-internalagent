"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

const AGENTS = [
  {
    id: "qa",
    name: "QA Test Agent",
    desc: "Maestro · Playwright · All products",
    color: "#1D9E75",
    bgColor: "#E1F5EE",
    defaultMode: "auto",
    defaultStatus: "idle",
  },
  {
    id: "research",
    name: "Research Agent",
    desc: "Weekly Monday 8AM · Competitor scan",
    color: "#534AB7",
    bgColor: "#EEEDFE",
    defaultMode: "auto",
    defaultStatus: "idle",
  },
  {
    id: "leads",
    name: "Lead Gen Agent",
    desc: "Daily 6AM · Bengaluru SMBs",
    color: "#BA7517",
    bgColor: "#FAEEDA",
    defaultMode: "auto",
    defaultStatus: "idle",
  },
];

const MOCK_LOGS = [
  { time: "14:32:01", type: "running", text: "QA Agent: Running EZBillify invoice flow test..." },
  { time: "14:31:58", type: "ok", text: "QA Agent: PASS EZ-Dine order creation (112ms)" },
  { time: "14:31:44", type: "err", text: "QA Agent: FAIL EZ-Connect CRM bulk import timeout" },
  { time: "14:28:11", type: "ok", text: "Bug Reporter: BUG filed — CRM import timeout · EZ-Connect · High" },
  { time: "06:00:42", type: "ok", text: "Lead Gen: 128 leads scraped · Bengaluru restaurants + grocery" },
  { time: "06:00:38", type: "info", text: "Lead Gen: Pushed to EZ-Connect CRM · 128 contacts created" },
];

export default function OverviewPage() {
  const [agents, setAgents] = useState(
    AGENTS.map((a) => ({ ...a, mode: a.defaultMode, status: a.defaultStatus }))
  );
  const [globalPaused, setGlobalPaused] = useState(false);
  const [macMiniOnline, setMacMiniOnline] = useState(true);

  const triggerAgent = async (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: "running" } : a))
    );
    // Call n8n webhook
    try {
      await fetch("/api/agents/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: agentId }),
      });
    } catch {}
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, status: "idle" } : a))
      );
    }, 5000);
  };

  const toggleMode = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a;
        const modes = ["auto", "manual", "paused"];
        const next = modes[(modes.indexOf(a.mode) + 1) % modes.length];
        return { ...a, mode: next };
      })
    );
  };

  const killAll = async () => {
    setGlobalPaused(true);
    setAgents((prev) => prev.map((a) => ({ ...a, mode: "paused", status: "idle" })));
    try {
      await fetch("/api/agents/kill-all", { method: "POST" });
    } catch {}
  };

  const modeColor = (mode: string) => {
    if (mode === "auto") return "badge-green";
    if (mode === "manual") return "badge-blue";
    return "badge-gray";
  };

  const statusColor = (status: string) => {
    if (status === "running") return "badge-amber";
    return "badge-gray";
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Agent overview</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className={`badge ${macMiniOnline ? "badge-green" : "badge-red"}`}>
            <span className={`pulse ${macMiniOnline ? "pulse-green" : "pulse-gray"}`} />
            Mac Mini {macMiniOnline ? "online" : "offline"}
          </span>
          {globalPaused ? (
            <button
              className="btn btn-primary"
              onClick={() => { setGlobalPaused(false); setAgents((prev) => prev.map((a) => ({ ...a, mode: "auto" }))); }}
            >
              Resume all agents
            </button>
          ) : (
            <button className="btn btn-danger" onClick={killAll}>
              Kill switch — stop all
            </button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Tests run today</div>
          <div className="metric-value">47</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Bugs filed</div>
          <div className="metric-value" style={{ color: "#A32D2D" }}>3</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Leads today</div>
          <div className="metric-value" style={{ color: "#3B6D11" }}>128</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Agent uptime</div>
          <div className="metric-value">99%</div>
        </div>
      </div>

      {/* Agents */}
      <div className="section-label">Agents</div>
      {agents.map((agent) => (
        <div className="card" key={agent.id}>
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: agent.bgColor, display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke={agent.color} strokeWidth="1.2" />
                  <path d="M8 5v3l2 1.5" stroke={agent.color} strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="card-title">{agent.name}</div>
                <div style={{ fontSize: 11, color: "#888780" }}>{agent.desc}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className={`badge ${modeColor(agent.mode)}`}
                onClick={() => toggleMode(agent.id)}
                style={{ cursor: "pointer", border: "none" }}
              >
                {agent.mode}
              </button>
              {agent.status === "running" && (
                <span className="badge badge-amber">
                  <span className="pulse pulse-amber" />running
                </span>
              )}
              <a href={`/agents/${agent.id}`} className="btn">View logs</a>
              <button
                className="btn btn-primary"
                onClick={() => triggerAgent(agent.id)}
                disabled={agent.mode === "paused"}
              >
                Trigger
              </button>
            </div>
          </div>

          {/* Mini log strip */}
          <div className="log-strip">
            {MOCK_LOGS.filter((_, i) => i < 2).map((log, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "#B4B2A9", flexShrink: 0 }}>{log.time}</span>
                <span className={`log-${log.type}`}>{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Live logs */}
      <div className="section-label">Live logs</div>
      <div className="card">
        <div className="log-strip" style={{ maxHeight: 200, overflowY: "auto" }}>
          {MOCK_LOGS.map((log, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#B4B2A9", flexShrink: 0 }}>{log.time}</span>
              <span className={`log-${log.type}`}>{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
