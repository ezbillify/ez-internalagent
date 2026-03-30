"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Users, Search, Download, Play, CheckCircle2, 
  MapPin, Phone, Store, ArrowRight, FileSpreadsheet,
  Globe, Loader2, AlertCircle, Trash2,
  Printer, Undo, Redo, FileSearch, Filter, ChevronDown,
  Share2, MessageSquare, Menu, LayoutGrid, Type, AlignLeft,
  X, SlidersHorizontal, Settings2, MoreVertical,
  Table as TableIcon,
  Database
} from "lucide-react";

export default function SheetsLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // 🔍 Dynamic Filters State
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = new Set(leads.map(l => l.category || 'Unknown'));
    return ["All", ...Array.from(cats)];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
        const matchesQuery = (l.name || "").toLowerCase().includes(filterQuery.toLowerCase()) || 
                             (l.category || "").toLowerCase().includes(filterQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || l.category === selectedCategory;
        return matchesQuery && matchesCategory;
    });
  }, [leads, filterQuery, selectedCategory]);

  const fetchLatestLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRunning(false);
    }
  };

  const clearLeads = async () => {
    if (!confirm("⚠️ PERMANENT WIPE: This will DELETE all generated leads from leads.xlsx. Proceed?")) return;
    setLoading(true);
    try {
        const res = await fetch("/api/leads/clear", { method: "POST" });
        if (res.ok) {
            setLeads([]);
        }
    } catch (err) {
        alert("Failed to clear data.");
    } finally {
        setLoading(false);
    }
  };

  const triggerLeadGen = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/agents/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: "leads" })
      });
      if (!res.ok) throw new Error("Failed to start agent");
      setTimeout(fetchLatestLeads, 8000); 
    } catch (err: any) {
      setError(err.message);
      setRunning(false);
    }
  };

  useEffect(() => {
    fetchLatestLeads();
  }, []);

  const ToolbarIcon = ({ Icon, active = false, onClick }: { Icon: any, active?: boolean, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        style={{ 
            padding: 6, 
            borderRadius: 4, 
            cursor: "pointer", 
            background: active ? "var(--primary-enterprise)15" : "transparent",
            color: active ? "var(--primary-enterprise)" : "var(--text-muted)",
            transition: "all 0.15s"
        }}
    >
        <Icon size={15} />
    </div>
  );

  return (
    <div style={{ height: "calc(100vh - 0px)", display: "flex", background: "var(--background)", overflow: "hidden" }}>
      
      {/* 🚀 DYNAMIC SIDE FILTER BAR (Sapphire Glass) 🚀 */}
      {showFilters && (
        <div className="animate-in slide-in-from-left duration-300" style={{ width: 320, background: "white", borderRight: "1px solid var(--border-standard)", padding: 32, display: "flex", flexDirection: "column", gap: 32, boxShadow: "10px 0 30px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-main)" }}>Data Governance</h3>
                <X size={18} style={{ cursor: "pointer", opacity: 0.5 }} onClick={() => setShowFilters(false)} />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Strategic Search</label>
                <div style={{ position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted)" }} />
                    <input 
                        className="input-enterprise" 
                        placeholder="Search lead cluster..." 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        style={{ paddingLeft: 42, width: "100%", height: 44, borderRadius: 10, fontSize: 13, fontWeight: 500 }}
                    />
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Vertical Taxonomy</label>
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-enterprise"
                    style={{ height: 44, borderRadius: 10, padding: "0 14px", fontSize: 13, fontWeight: 600 }}
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div style={{ marginTop: "auto", padding: 24, background: "var(--surface-container-low)", borderRadius: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>Filter Analytics</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    <span>Visible Leads</span>
                    <span style={{ color: "var(--primary-enterprise)" }}>{filteredLeads.length}</span>
                </div>
                <button 
                    onClick={() => { setFilterQuery(""); setSelectedCategory("All"); }}
                    style={{ width: "100%", background: "white", color: "var(--text-main)", padding: "12px", borderRadius: 10, border: "1.5px solid var(--border-standard)", fontWeight: 700, fontSize: 12, cursor: "pointer", marginTop: 16 }}
                >
                    RESET QUERY
                </button>
            </div>
        </div>
      )}

      {/* 🔵 MAIN ANALYTICAL ENGINE AREA 🔵 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* 🔵 ATELIER STYLE HEADER 🔵 */}
        <div style={{ background: "white", padding: "20px 32px 12px", borderBottom: "1px solid var(--border-standard)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--primary-enterprise)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(0,60,144,0.15)" }}>
                        <Database size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.03em" }}>Autonomous Master Database</h1>
                            <div style={{ borderRadius: 6, padding: '2px 8px', fontSize: 9, fontWeight: 800, background: "var(--primary-enterprise)10", color: "var(--primary-enterprise)" }}>SYSTEM_INTEGRATED</div>
                        </div>
                        <div style={{ display: "flex", gap: 20, fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                            {["File", "Edit", "View", "Insert", "Data", "Oversight"].map(m => (
                                <span key={m} style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary-enterprise)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>{m}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={clearLeads} style={{ height: 40, padding: "0 16px", borderRadius: 8, background: "white", border: "1.5px solid #fee2e2", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                        <Trash2 size={15} /> PURGE DATASET
                    </button>
                    <button onClick={() => setShowFilters(!showFilters)} style={{ height: 40, padding: "0 16px", borderRadius: 8, background: showFilters ? "var(--primary-enterprise)" : "white", border: "1.5px solid var(--border-standard)", color: showFilters ? "white" : "var(--text-main)", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                        <SlidersHorizontal size={15} /> GOVERNANCE
                    </button>
                    <button onClick={triggerLeadGen} disabled={running} style={{ height: 40, padding: "0 20px", borderRadius: 8, background: "var(--primary-enterprise)", border: "none", color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 10px 20px rgba(0,60,144,0.1)" }}>
                        {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="white" />}
                        {running ? "SYNCING..." : "DEPLOY CAMPAIGN"}
                    </button>
                </div>
            </div>

            {/* QUICK ACTIONS TOOLBAR */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--surface-container-low)", borderRadius: 12, padding: "4px 12px", width: "fit-content" }}>
                <ToolbarIcon Icon={Printer} />
                <ToolbarIcon Icon={Undo} />
                <ToolbarIcon Icon={Redo} />
                <div style={{ width: 1, height: 16, background: "var(--border-standard)", margin: "0 8px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "var(--text-main)", padding: "0 8px" }}>
                    100% SCALE <ChevronDown size={12} />
                </div>
                <div style={{ width: 1, height: 16, background: "var(--border-standard)", margin: "0 8px" }} />
                <ToolbarIcon Icon={Type} />
                <ToolbarIcon Icon={Filter} active={showFilters} onClick={() => setShowFilters(!showFilters)} />
            </div>
        </div>

        {/* 📊 FORMULA BAR 📊 */}
        <div style={{ background: "white", padding: "8px 32px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--border-standard)" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--primary-enterprise)", width: 30, textAlign: "center" }}>fx</div>
            <div style={{ width: 1, height: 24, background: "var(--border-standard)" }} />
            <div style={{ flex: 1, fontSize: 14, color: "var(--text-main)", fontWeight: 600, fontStyle: running ? "italic" : "normal" }}>
                {running ? "=AGENT_SALES_ENGINE(LEAD_HARVEST, SECTOR=GLOBAL, PRECISION=HIGH)" : filteredLeads.length > 0 ? `=ANALYZE(VIS_CELLS) returns ${filteredLeads.length} prioritized identities` : "System standby. Awaiting autonomous cycle..."}
            </div>
        </div>

        {/* 📑 GRID 📑 */}
        <div style={{ flex: 1, overflow: "auto", position: "relative", background: "#ffffff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <tr style={{ background: "var(--surface-container-low)" }}>
                        <th style={{ width: 50, border: "1px solid var(--border-standard)", height: 32 }} />
                        {["BUSINESS IDENTITY", "TAXONOMY", "COMMUNICATION", "LOCATION", "STRATEGIC FIT", "VALIDATION"].map(h => (
                            <th key={h} style={{ border: "1px solid var(--border-standard)", padding: "8px 16px", fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textAlign: "left", letterSpacing: "0.1em" }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredLeads.length === 0 ? (
                        Array.from({ length: 40 }).map((_, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--border-standard)" }}>
                                <td style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", background: "var(--surface-container-low)", border: "1px solid var(--border-standard)" }}>{i + 1}</td>
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <td key={j} style={{ border: "1px solid var(--border-standard)", height: 36 }} />
                                ))}
                            </tr>
                        ))
                    ) : (
                        filteredLeads.map((lead: any, i: number) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--border-standard)", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-container-low)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                <td style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: "var(--text-muted)", background: "var(--surface-container-low)", border: "1px solid var(--border-standard)" }}>{i + 1}</td>
                                <td style={{ border: "1px solid var(--border-standard)", padding: "10px 16px", fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>{lead.name}</td>
                                <td style={{ border: "1px solid var(--border-standard)", padding: "10px 16px" }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, background: "var(--primary-enterprise)10", color: "var(--primary-enterprise)", padding: '4px 10px', borderRadius: 6 }}>{lead.category?.toUpperCase()}</span>
                                </td>
                                <td style={{ border: "1px solid var(--border-standard)", padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--primary-enterprise)" }}>{lead.phone}</td>
                                <td style={{ border: "1px solid var(--border-standard)", padding: "10px 16px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.address}</td>
                                <td style={{ border: "1px solid var(--border-standard)", padding: "10px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--secondary)", fontWeight: 800, fontSize: 12 }}>
                                        <CheckCircle2 size={14} /> {lead.product_fit?.toUpperCase()}
                                    </div>
                                </td>
                                <td style={{ border: "1px solid var(--border-standard)", padding: "10px 16px" }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                                        <Globe size={12} /> VERIFIED_SOURCE
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* 🔵 SHEETS FOOTER 🔵 */}
        <div style={{ background: "white", padding: "10px 32px", borderTop: "1px solid var(--border-standard)", display: "flex", alignItems: "center", gap: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontWeight: 800, color: "var(--primary-enterprise)", borderBottom: '3px solid var(--primary-enterprise)', padding: '6px 16px', background: "var(--primary-enterprise)10", borderRadius: '6px 6px 0 0' }}>
                <TableIcon size={16} /> Autonomous_Output_Log
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
                <LayoutGrid size={15} /> RECORD_COUNT: {leads.length} | ACTIVE_FILTER: {selectedCategory.toUpperCase()}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, padding: "4px 12px", background: "#4ade8020", color: "#16a34a", borderRadius: 20 }}>OLLAMA_NOMINAL</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }}></div> CLUSTER_STATUS: ONLINE
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
