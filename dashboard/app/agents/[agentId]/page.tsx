"use client";

import { useState, useEffect, use } from "react";
import { Activity, Settings, Terminal, Play, BarChart2, Database } from "lucide-react";
import Link from "next/link";

export default function AgentDetailPage({ params: paramsPromise }: { params: Promise<{ agentId: string }> }) {
    const params = use(paramsPromise);
    const agentId = params.agentId;
    const [data, setData] = useState<any>(null);
    const [liveStatus, setLiveStatus] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [s, l] = await Promise.all([fetch("/api/agent/status"), fetch("/api/stats")]);
                if (s.ok) { const j = await s.json(); setData({ metrics: j.agents?.[agentId]?.metrics || {}, logs: (j.logs || []).filter((x: any) => x.text?.toLowerCase().includes(agentId)) }); }
                if (l.ok) setLiveStatus((await l.json())[agentId]);
            } catch { }
        };
        fetchData();
        const i = setInterval(fetchData, 3000);
        return () => clearInterval(i);
    }, [agentId]);

    if (!data) return <div style={{ padding: 40, color: "#525252" }}>Loading agent data…</div>;

    const nameMap: any = { qa: "Cluster Monitor", research: "Market Intel Agent", leads: "Opportunity Engine" };
    const status = liveStatus?.status || "idle";
    const running = status === "running";
    const perfData = [60, 45, 80, 70, 95, 65, 85, 90, 75, 100, 80, 70, 60, 85, 90, 75];

    return (
        <div>
            {/* Breadcrumbs */}
            <nav style={{ fontSize: 12, color: "#525252", marginBottom: 16, display: "flex", gap: 6 }}>
                <Link href="/" style={{ color: "#0f62fe", textDecoration: "none" }}>Dashboard</Link>
                <span>/</span>
                <span>{nameMap[agentId] || agentId}</span>
            </nav>

            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">{nameMap[agentId] || agentId}</h1>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                        <span className={`tag ${running ? "tag-green" : "tag-gray"}`}>{status}</span>
                        <span style={{ fontSize: 12, color: "#6f6f6f", fontFamily: "'IBM Plex Mono', monospace" }}>node_{agentId}_x1</span>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary"><Settings size={16} /> Configure</button>
                    <button className="btn btn-primary" disabled={running}><Play size={16} fill="currentColor" /> Force Invoke</button>
                </div>
            </div>

            {/* Status Banner */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <div style={{ width: 56, height: 56, background: "#fafafa", border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Activity size={28} color={running ? "#0f62fe" : "#a8a8a8"} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#525252", textTransform: "uppercase", marginBottom: 4 }}>Current Task</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#161616", fontFamily: "'IBM Plex Mono', monospace" }}>
                            {liveStatus?.task || "Awaiting activation…"}
                        </div>
                    </div>
                    <div style={{ borderLeft: "1px solid #e0e0e0", paddingLeft: 24 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#525252", textTransform: "uppercase", marginBottom: 4 }}>Compute</div>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>0.04 CPU · 120 MB</div>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
                {/* Left: Charts & Tables */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div className="card">
                        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><BarChart2 size={16} /> Performance (24h)</span>
                        </div>
                        <div className="card-body">
                            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 140 }}>
                                {perfData.map((v, i) => (
                                    <div key={i} style={{ flex: 1, height: `${v}%`, background: "#c6c6c6", transition: "background 0.15s" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#0f62fe")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "#c6c6c6")} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Metrics Table */}
                    <div className="card">
                        <div className="card-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Database size={16} /> Agent Metrics
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(data.metrics).map(([k, v]) => (
                                    <tr key={k}>
                                        <td style={{ fontWeight: 500 }}>{k.replace(/([A-Z])/g, " $1").trim()}</td>
                                        <td style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{v as any}</td>
                                    </tr>
                                ))}
                                {Object.keys(data.metrics).length === 0 && (
                                    <tr><td colSpan={2} style={{ textAlign: "center", color: "#6f6f6f", padding: 24 }}>No metrics available yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Log Pane */}
                <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div className="card-header" style={{ background: "#262626", color: "#f4f4f4", borderColor: "#393939", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><Terminal size={14} /> Unit Traces</span>
                        <span style={{ fontSize: 11, color: "#6f6f6f" }}>Live</span>
                    </div>
                    <div className="log-pane" style={{ flex: 1, padding: 16, maxHeight: "calc(100vh - 340px)" }}>
                        {data.logs.length > 0 ? data.logs.map((log: any, i: number) => (
                            <div key={i} style={{ marginBottom: 6, display: "flex", gap: 12 }}>
                                <span style={{ color: "#6f6f6f", flexShrink: 0 }}>{log.time}</span>
                                <span style={{ color: log.type === "err" ? "#ff8389" : log.type === "ok" ? "#42be65" : "#c6c6c6" }}>{log.text}</span>
                            </div>
                        )) : <div style={{ color: "#6f6f6f", fontStyle: "italic" }}>No traces for this unit yet.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
