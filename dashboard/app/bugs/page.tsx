"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Activity, ShieldAlert } from "lucide-react";

export default function BugsPage() {
    const [bugs, setBugs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBugs = async () => {
            try { const r = await fetch("/api/agent/status"); const d = await r.json(); setBugs((d.logs || []).filter((l: any) => l.type === "err")); } catch { } finally { setLoading(false); }
        };
        fetchBugs();
    }, []);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Anomaly Tracker</h1>
                    <p style={{ fontSize: 14, color: "#525252", marginTop: 4 }}>Unhandled execution failures across the active fleet.</p>
                </div>
                <button className="btn btn-primary">Run Fleet Audit</button>
            </div>

            {/* KPIs */}
            <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                <div className="kpi-tile" style={{ borderLeft: "4px solid #da1e28" }}>
                    <div className="kpi-label">Critical Failures (P0)</div>
                    <div className="kpi-value">{bugs.length}</div>
                </div>
                <div className="kpi-tile">
                    <div className="kpi-label">System Integrity</div>
                    <div className="kpi-value">{bugs.length === 0 ? "100%" : "82.4%"}</div>
                </div>
                <div className="kpi-tile">
                    <div className="kpi-label">Last Trace</div>
                    <div className="kpi-value" style={{ fontSize: 20 }}>{bugs[0]?.time || "No faults"}</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}><ShieldAlert size={16} /> Incident Queue</span>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Severity</th>
                            <th>Timestamp</th>
                            <th>Fault Trace</th>
                            <th style={{ textAlign: "right" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bugs.map((bug, i) => (
                            <tr key={i}>
                                <td><span className="tag tag-red">Critical</span></td>
                                <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#525252" }}>{bug.time}</td>
                                <td style={{ maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bug.text}</td>
                                <td style={{ textAlign: "right" }}>
                                    <button style={{ background: "none", border: "none", color: "#0f62fe", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Triage</button>
                                </td>
                            </tr>
                        ))}
                        {bugs.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: "center", padding: 48 }}>
                                    <Activity size={32} color="#198038" style={{ margin: "0 auto 12px", display: "block" }} />
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Zero Active Anomalies</div>
                                    <div style={{ fontSize: 13, color: "#525252" }}>Fleet is operating within nominal limits.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
