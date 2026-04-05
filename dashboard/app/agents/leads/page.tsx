"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, Search, Play, CheckCircle2, Globe, Loader2, Trash2, SlidersHorizontal, X, Database, LayoutGrid, Table as TableIcon } from "lucide-react";

export default function SheetsLeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [running, setRunning] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filterQuery, setFilterQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = useMemo(() => { const c = new Set(leads.map(l => l.category || "Unknown")); return ["All", ...Array.from(c)]; }, [leads]);
    const filteredLeads = useMemo(() => leads.filter(l => {
        const q = (l.name || "").toLowerCase().includes(filterQuery.toLowerCase()) || (l.category || "").toLowerCase().includes(filterQuery.toLowerCase());
        const c = selectedCategory === "All" || l.category === selectedCategory;
        return q && c;
    }), [leads, filterQuery, selectedCategory]);

    const fetchLeads = async () => {
        setLoading(true);
        try { const r = await fetch("/api/leads"); if (r.ok) { const d = await r.json(); setLeads(d.leads || []); } } catch { } finally { setLoading(false); setRunning(false); }
    };

    const clearLeads = async () => {
        if (!confirm("This will DELETE all generated leads from leads.xlsx. Proceed?")) return;
        setLoading(true);
        try { const r = await fetch("/api/leads/clear", { method: "POST" }); if (r.ok) setLeads([]); } catch { } finally { setLoading(false); }
    };

    const triggerLeadGen = async () => {
        setRunning(true);
        try { const r = await fetch("/api/agents/invoke", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agent: "leads" }) }); if (!r.ok) throw new Error(); setTimeout(fetchLeads, 8000); } catch { setRunning(false); }
    };

    useEffect(() => { fetchLeads(); }, []);

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Leads Engine</h1>
                    <p style={{ fontSize: 14, color: "#525252", marginTop: 4 }}>Autonomous lead extraction and CRM synapse management.</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-danger" style={{ height: 36, fontSize: 13 }} onClick={clearLeads}><Trash2 size={14} /> Purge</button>
                    <button className={`btn ${showFilters ? "btn-primary" : "btn-secondary"}`} style={{ height: 36, fontSize: 13 }} onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={14} /> Filters</button>
                    <button className="btn btn-primary" style={{ height: 36, fontSize: 13 }} onClick={triggerLeadGen} disabled={running}>
                        {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                        {running ? "Running…" : "Deploy Campaign"}
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", gap: 24 }}>
                {/* Filter Sidebar */}
                {showFilters && (
                    <div style={{ width: 280, background: "#fff", border: "1px solid #e0e0e0", padding: 24, flexShrink: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>Filters</span>
                            <X size={16} style={{ cursor: "pointer", color: "#6f6f6f" }} onClick={() => setShowFilters(false)} />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label className="form-label">Search</label>
                            <input className="form-input" placeholder="Search leads…" value={filterQuery} onChange={e => setFilterQuery(e.target.value)} />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label className="form-label">Category</label>
                            <select className="form-input" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ padding: 16, background: "#fafafa", border: "1px solid #e0e0e0" }}>
                            <div style={{ fontSize: 12, color: "#6f6f6f", marginBottom: 8, fontWeight: 600 }}>Results</div>
                            <div style={{ fontSize: 20, fontWeight: 400 }}>{filteredLeads.length} <span style={{ fontSize: 13, color: "#6f6f6f" }}>of {leads.length}</span></div>
                        </div>
                        <button className="btn btn-secondary" style={{ width: "100%", marginTop: 16, height: 36, fontSize: 13 }}
                            onClick={() => { setFilterQuery(""); setSelectedCategory("All"); }}>
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Main Table */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card" style={{ overflow: "hidden" }}>
                        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Database size={16} /> Lead Database</span>
                            <span style={{ fontSize: 12, color: "#525252" }}>{filteredLeads.length} records</span>
                        </div>
                        <div style={{ overflow: "auto", maxHeight: "calc(100vh - 260px)" }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 50 }}>#</th>
                                        <th>Business Name</th>
                                        <th>Category</th>
                                        <th>Phone</th>
                                        <th>Location</th>
                                        <th>Fit</th>
                                        <th>Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.length > 0 ? filteredLeads.map((lead, i) => (
                                        <tr key={i}>
                                            <td style={{ fontSize: 12, color: "#6f6f6f", fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{lead.name}</td>
                                            <td><span className="tag tag-blue">{lead.category?.toUpperCase()}</span></td>
                                            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#0f62fe" }}>{lead.phone}</td>
                                            <td style={{ fontSize: 13, color: "#525252", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.address}</td>
                                            <td style={{ display: "flex", alignItems: "center", gap: 6, color: "#198038", fontWeight: 600, fontSize: 12 }}><CheckCircle2 size={14} /> {lead.product_fit?.toUpperCase()}</td>
                                            <td style={{ fontSize: 11, color: "#6f6f6f", display: "flex", alignItems: "center", gap: 4 }}><Globe size={12} /> Verified</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={7} style={{ textAlign: "center", padding: 48, color: "#525252" }}>
                                            {loading ? "Loading data…" : "No leads generated yet. Run a campaign to populate."}
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 12, color: "#6f6f6f" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <LayoutGrid size={14} /> Records: {leads.length} · Filter: {selectedCategory}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#42be65" }} />
                            Cluster Online
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
