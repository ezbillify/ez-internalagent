"use client";

import { useState, useEffect } from "react";
import { 
  MonitorCheck, 
  Github, 
  Layout, 
  Smartphone, 
  Search, 
  ShieldCheck, 
  Lightbulb, 
  Globe,
  Plus,
  ChevronDown,
  ChevronUp,
  Tag,
  Trash2,
  X,
  PlusCircle,
  Loader2,
  Zap,
  Target,
  Trophy,
  History,
  Activity,
  Cpu,
  Waves,
  Database,
  ChevronRight
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  type: string;
  repo: string;
  active: boolean;
  intel?: {
    description: string;
    features: string[];
    target_persona: string;
    keywords: string[];
    tech_stack: string[];
    analyzed_at: string;
    competitor_data?: any[];
    market_trends?: any[];
    feature_ideas?: any[];
    summary?: string;
    error?: string;
  };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [invoking, setInvoking] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<any>({});

  const [form, setForm] = useState({
    name: "",
    type: "nextjs",
    repo: "",
    branch: "main",
    deep: true
  });

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchLiveStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStatus = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) setLiveStatus(await res.json());
    } catch {}
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!form.repo) return;
    
    setLoading(true);
    try {
      // 1. Trigger the Python Research & Lead Gen Pipeline
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_url: form.repo,
          product_name: form.name || undefined,
          deep_analysis: form.deep
        })
      });

      if (!res.ok) throw new Error("Backend offline");

      // 2. Clear and refresh
      setShowAdd(false);
      setForm({ name: "", type: "nextjs", repo: "", branch: "main", deep: true });
      
      // Initial list refresh
      await fetchProducts();
    } catch (err) {
      console.error("Backend Error:", err);
      alert("Python Backend (Port 8000) not reached. Ensure python/server.py is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure? This will also stop lead generation for this product.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      await fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const invokeAgent = async (agent: string, productId: string) => {
    setInvoking(`${agent}-${productId}`);
    try {
      if (agent === "research") {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        await fetch("http://localhost:8000/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            github_url: product.repo,
            product_name: product.name,
            deep_analysis: true
          })
        });
      } else {
        await fetch("/api/agents/invoke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent, product: productId })
        });
      }
      
      // Auto-refresh after a delay
      setTimeout(fetchProducts, 10000); 
    } catch (err) {
      console.error(err);
    } finally {
      setInvoking(null);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div style={{ padding: 80, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary-enterprise)" />
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Initializing Analytical Workspace...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500" style={{ padding: "32px 40px" }}>
      {/* 🏛️ BREADCRUMBS & HEADER */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          <span>EZ Agent Hub</span>
          <span style={{ opacity: 0.3 }}>/</span>
          <span style={{ color: "var(--primary-enterprise)" }}>Fleet Monitoring</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.03em" }}>Fleet Monitoring Hub</h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, maxWidth: 600 }}>
              Autonomous unit orchestration cluster. Monitoring real-time technical pulse and market coverage across all deployed agents.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ gap: 8, height: 44, padding: "0 24px", borderRadius: 8, boxShadow: "var(--shadow-ambient)" }}>
            <PlusCircle size={18} /> Register New Agent
          </button>
        </div>
      </div>

      {/* 📊 EXECUTIVE KPI SUMMARY */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 }}>
        {[
          { label: "Autonomous Units", value: products.length, sub: "Active Repositories", icon: Cpu, color: "var(--primary-enterprise)" },
          { label: "Technical Pulse", value: "99.8%", sub: "Cluster Stability", icon: Waves, color: "var(--secondary)" },
          { label: "Market Coverage", value: "84%", sub: "Intelligence Reach", icon: Globe, color: "#f59e0b" },
        ].map((kpi, i) => (
          <div key={i} className="card-enterprise" style={{ padding: 24, border: "none", background: "var(--surface-container-lowest)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${kpi.color}10`, display: "flex", alignItems: "center", justifyContent: "center", color: kpi.color }}>
                <kpi.icon size={20} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Live Telemetry</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)" }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>{kpi.label} — <span style={{ opacity: 0.6 }}>{kpi.sub}</span></div>
          </div>
        ))}
      </div>

      {/* 🚀 REGISTRATION & INGEST */}
      {showAdd && (
        <div className="animate-in zoom-in-95 duration-200" style={{ marginBottom: 48 }}>
          <div className="card-enterprise" style={{ padding: 40, border: "none", background: "var(--surface-container-low)", borderLeft: "6px solid var(--primary-enterprise)", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 14, background: "var(--primary-enterprise)", 
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white",
                  boxShadow: "0 10px 20px rgba(0,60,144,0.2)"
                }}>
                  <Zap size={24} fill="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>Deploy Autonomous Research Unit</h2>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Enter a GitHub URL to trigger the deep-ingest v2 pipeline.</p>
                </div>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ padding: 10, background: "rgba(0,0,0,0.04)", border: "none", borderRadius: "50%", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2.5fr", gap: 32 }}>
              <div style={{ display: "grid", gap: 24 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 10, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agent Alias</label>
                  <input className="input-enterprise" style={{ height: 52, borderRadius: 12, border: "2px solid var(--border-standard)" }} placeholder="e.g. Sales Intelligence Unit" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "white", borderRadius: 12, border: "1.5px solid var(--border-standard)" }}>
                  <input type="checkbox" id="deep" checked={form.deep} onChange={(e) => setForm({ ...form, deep: e.target.checked })} style={{ width: 18, height: 18 }} />
                  <label htmlFor="deep" style={{ fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Enable Deep Technical Ingest</label>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 10, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target Repository (GitHub)</label>
                <div style={{ position: "relative" }}>
                  <Github size={20} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "var(--primary-enterprise)" }} />
                  <input className="input-enterprise" style={{ height: 52, paddingLeft: 52, borderRadius: 12, border: "2px solid var(--primary-enterprise)", background: "rgba(0,60,144,0.02)", fontSize: 15, fontWeight: 600 }} placeholder="https://github.com/organization/project" value={form.repo} onChange={(e) => setForm({ ...form, repo: e.target.value })} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 40, display: "flex", justifyContent: "flex-end", gap: 16 }}>
              <button className="btn" style={{ fontWeight: 800, padding: "0 32px", height: 52, borderRadius: 12 }} onClick={() => setShowAdd(false)}>Discard</button>
              <button className="btn btn-primary" onClick={handleAddProduct} style={{ gap: 12, padding: "0 36px", height: 52, borderRadius: 12, fontWeight: 800, boxShadow: "0 15px 30px rgba(0,60,144,0.2)" }}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : <><Zap size={20} fill="white" /> Initialize v2 Analytics Portfolio</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📋 THE FLEET LIST */}
      <div style={{ display: "grid", gap: 12 }}>
        {products.map((product) => {
          const isExpanded = expanded === product.id;
          const intel = product.intel;
          const isRemoving = deleting === product.id;
          const isInvoking = invoking?.includes(product.id);

          return (
            <div key={product.id} className="card-enterprise" style={{ 
              opacity: isRemoving ? 0.5 : 1, 
              border: "none",
              padding: 0,
              overflow: "hidden",
              background: isExpanded ? "var(--surface-container-lowest)" : "var(--surface-container-lowest)",
              boxShadow: isExpanded ? "0 20px 50px rgba(0,0,0,0.06)" : "var(--shadow-ambient)"
            }}>
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 24 }}>
                {/* AI Avatar / Identity */}
                <div style={{
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                  background: `linear-gradient(135deg, ${product.type === "flutter" ? "#7c3aed" : "#003c90"} 0%, ${product.type === "flutter" ? "#a855f7" : "#0f52ba"} 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                }}>
                  {product.type === "flutter" ? <Smartphone size={24} /> : <Layout size={24} />}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>{product.name}</h3>
                    <div style={{ 
                      fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 4,
                      background: intel && !intel.error ? "var(--secondary-container)" : "var(--surface-container-high)",
                      color: intel && !intel.error ? "var(--secondary)" : "var(--text-muted)"
                    }}>
                      {intel && !intel.error ? "AI PROFILE READY" : "AWAITING RESEARCH"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 12, fontWeight: 600 }}>
                      <Github size={12} style={{ opacity: 0.6 }} />
                      <span>{product.repo.split('/').pop()}</span>
                    </div>
                    <div style={{ width: 1, height: 12, background: "var(--border-standard)" }}></div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-enterprise)", opacity: 0.8 }}>
                      {product.type.toUpperCase()} CLUSTER
                    </div>
                  </div>
                </div>

                {/* Micro Sparkline (Simulated) */}
                <div style={{ width: 120, height: 32, display: "flex", alignItems: "flex-end", gap: 2, marginRight: 20 }}>
                  {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: "var(--secondary)", opacity: 0.15 + (i * 0.1), borderRadius: 1 }}></div>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setExpanded(isExpanded ? null : product.id)} style={{ 
                    height: 36, padding: "0 16px", borderRadius: 6, border: "none", 
                    background: isExpanded ? "var(--primary-enterprise)" : "var(--surface-container-low)",
                    color: isExpanded ? "white" : "var(--text-main)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    transition: "all 0.2s"
                  }}>
                    {isExpanded ? "Close Insights" : "Deep Intelligence View"}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} disabled={isRemoving} style={{ 
                    width: 36, height: 36, borderRadius: 6, border: "none", background: "transparent", 
                    color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s"
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="animate-in slide-in-from-top-4 duration-300" style={{ padding: "0 24px 32px", background: "var(--surface-container-lowest)" }}>
                  <div style={{ height: 1, background: "var(--border-standard)", margin: "0 -24px 32px" }}></div>
                  
                  {intel && !intel.error && !(liveStatus?.active_product === product.id && liveStatus?.agents?.some((a: any) => a.status === "running")) ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 60 }}>
                      <div>
                        {/* Summary */}
                        <div style={{ marginBottom: 40 }}>
                          <h4 style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Technical Value Proposition</h4>
                          <p style={{ fontSize: 15, color: "var(--text-main)", lineHeight: 1.7, fontWeight: 500 }}>{intel.description || "Synthesizing product identity..."}</p>
                        </div>
                        
                        {/* Grid Details */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
                          <div>
                            <h4 style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                              <Target size={14} /> Market Fit
                            </h4>
                            <div style={{ padding: 20, background: "var(--surface-container-low)", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "var(--text-main)", borderLeft: "4px solid var(--secondary)", boxShadow: "var(--shadow-ambient)" }}>
                              {intel.target_persona || "Analyzing market segment..."}
                            </div>
                          </div>
                          <div>
                            <h4 style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                              <ShieldCheck size={14} /> Tech Pulse Cluster
                            </h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                              {(intel.tech_stack || ["React", "Node.js", "Python"]).map((tech: string, i: number) => (
                                <span key={i} style={{ 
                                  fontSize: 11, fontWeight: 800, padding: "8px 14px", background: "white", borderRadius: 8, 
                                  border: "1px solid var(--border-standard)", color: "var(--primary-enterprise)",
                                  display: "flex", alignItems: "center", gap: 6
                                }}>
                                  <Cpu size={10} /> {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Feature Roadmap */}
                        <div>
                          <h4 style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                            <Trophy size={14} /> Strategic AI Roadmap
                          </h4>
                          <div style={{ display: "grid", gap: 16 }}>
                            {(intel.feature_ideas || [
                              { title: "Automated Lead Scoring", description: "Priority ranking based on tech fit.", impact: 5 },
                              { title: "Neural Pitch Crafting", description: "Personalized outreach generation.", impact: 4 }
                            ]).map((feature: any, i: number) => (
                              <div key={i} className="feature-row" style={{ padding: 24, background: "white", borderRadius: 16, border: "1.5px solid var(--border-standard)", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s" }}>
                                <div>
                                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>{feature.title}</div>
                                  <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{feature.description}</div>
                                </div>
                                <div style={{ textAlign: "right", minWidth: 80 }}>
                                  <div style={{ fontSize: 9, fontWeight: 800, color: "var(--secondary)", marginBottom: 4 }}>INTEL PRIORITY</div>
                                  <div style={{ display: "flex", gap: 2 }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <div key={star} style={{ width: 6, height: 6, borderRadius: "50%", background: star <= feature.impact ? "var(--secondary)" : "rgba(0,0,0,0.05)" }}></div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Panel: Metadata & Worker Status */}
                      <div>
                        {/* SEO Tags */}
                        <div style={{ marginBottom: 44 }}>
                          <h4 style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <Search size={14} /> Market Identification Anchors
                          </h4>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                            {(intel.keywords || ["Enterprise", "SaaS", "Efficiency"]).map((kw: string, i: number) => (
                              <span key={i} style={{ padding: "10px 16px", borderRadius: 12, background: "rgba(0,60,144,0.04)", fontSize: 12, fontWeight: 800, color: "var(--primary-enterprise)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <Tag size={12} fill="currentColor" /> {kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Worker Control */}
                        <div style={{ padding: 40, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: 28, color: "white", boxShadow: "0 30px 60px rgba(0,0,0,0.3)", position: "relative", overflow: "hidden" }}>
                          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "rgba(255,255,255,0.03)", borderRadius: "50%" }}></div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                            <div className="animate-pulse" style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 15px #10b981" }}></div>
                            <h5 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.7 }}>Fleet Command Hub</h5>
                          </div>
                          
                          <div style={{ display: "grid", gap: 24, marginBottom: 40 }}>
                            {[
                              { label: "Autonomous Researcher", id: "research", activeColor: "#3b82f6" },
                              { label: "Market Discovery Engine", id: "leads", activeColor: "#10b981" },
                              { label: "Synapse Sync Engine", id: "ingest", activeColor: "#f59e0b" }
                            ].map(agent => {
                               const isActive = liveStatus?.agents?.find((a: any) => a.id === agent.id)?.status === "running";
                               return (
                                <div key={agent.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: 14, fontWeight: 600, opacity: isActive ? 1 : 0.6 }}>{agent.label}</span>
                                  <span style={{ fontSize: 11, fontWeight: 900, color: isActive ? agent.activeColor : "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>{isActive ? "CORE ACTIVE" : "STANDBY"}</span>
                                </div>
                               );
                            })}
                          </div>

                          <button className="btn" 
                            style={{ 
                              width: "100%", height: 56, background: "var(--primary-enterprise)", border: "none", color: "white", 
                              fontWeight: 900, borderRadius: 16, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em",
                              boxShadow: "0 15px 30px rgba(0,60,144,0.3)"
                            }} 
                            onClick={() => invokeAgent("research", product.id)}
                            disabled={isInvoking}
                          >
                            {isInvoking ? <Loader2 size={18} className="animate-spin" /> : "Restart Deep Intelligence Loop"}
                          </button>
                        </div>

                        {/* Master Database Link */}
                        <a href="/agents/leads" style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 32, padding: "24px", background: "white", borderRadius: 20, border: "2px dashed var(--border-standard)", textDecoration: "none", transition: "all 0.2s" }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                            <Database size={22} />
                          </div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>Autonomous Master Database</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginTop: 2 }}>Exported lead metadata for {product.name}</div>
                          </div>
                          <ChevronRight size={18} style={{ marginLeft: "auto", opacity: 0.3 }} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "100px 40px" }}>
                      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 40px" }}>
                        <div className="animate-spin" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, border: "4px solid rgba(0,60,144,0.1)", borderTopColor: "var(--primary-enterprise)", borderRadius: "50%" }}></div>
                        <Activity size={32} color="var(--primary-enterprise)" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
                      </div>
                      
                      <h4 style={{ fontSize: 24, fontWeight: 900, color: "var(--text-main)", letterSpacing: "-0.03em" }}>
                        {liveStatus?.agents?.some((a: any) => a.status === "running") 
                          ? "Executing Deep Intelligence Scan..." 
                          : "Initializing Cognitive Buffer..."}
                      </h4>
                      
                      <p style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 12, maxWidth: 550, margin: "12px auto 40px", lineHeight: 1.6 }}>
                        {liveStatus?.agents?.find((a: any) => a.status === "running")?.current_task || 
                          "The Autonomous Analyst fleet is initializing the repository ingestion cycle. This process involves multidimensional market mapping and lead generation."}
                      </p>

                      {/* Incremental Progress Bar */}
                      <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "left" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 12, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          <span>Pipeline Synchronization</span>
                          <span style={{ color: "var(--primary-enterprise)" }}>{(() => {
                             const completedCount = liveStatus?.agents?.filter((a: any) => a.status === "completed")?.length || 0;
                             const isRunning = liveStatus?.agents?.some((a:any) => a.status === "running");
                             const base = (completedCount / 5) * 100;
                             const incremental = isRunning ? 10 : 0;
                             return Math.min(100, Math.floor(base + incremental));
                          })()}%</span>
                        </div>
                        <div style={{ height: 16, background: "rgba(0,0,0,0.05)", borderRadius: 20, overflow: "hidden", position: "relative", padding: 3 }}>
                          <div className="transition-all duration-1000 ease-in-out" style={{ 
                            height: "100%", 
                            width: `${(() => {
                               const completedCount = liveStatus?.agents?.filter((a: any) => a.status === "completed")?.length || 0;
                               const isRunning = liveStatus?.agents?.some((a:any) => a.status === "running");
                               const base = (completedCount / 5) * 100;
                               const incremental = isRunning ? 10 : 0;
                               return Math.min(100, Math.floor(base + incremental));
                            })()}%`, 
                            background: "linear-gradient(90deg, var(--primary-enterprise) 0%, var(--secondary) 100%)",
                            borderRadius: 20,
                            boxShadow: "0 0 20px var(--primary-enterprise)40"
                          }}>
                            <div className="shimmer" style={{ animation: "progress-shimmer 2s infinite" }} />
                          </div>
                        </div>
                        <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 12 }}>
                           {["Trigger", "Ingest", "Analyze", "Research", "Leads"].map((s, idx) => {
                             const a = liveStatus?.agents?.[idx];
                             const isDone = a?.status === "completed";
                             const isCurrent = a?.status === "running";
                             return (
                               <div key={idx} style={{ 
                                 width: 8, height: 8, borderRadius: "50%", 
                                 background: isDone ? "#10b981" : isCurrent ? "var(--primary-enterprise)" : "rgba(0,0,0,0.1)",
                                 transition: "all 0.4s"
                               }} />
                             );
                           })}
                        </div>
                      </div>

                      {intel?.error && (
                        <button className="btn btn-primary" style={{ marginTop: 40, height: 56, padding: "0 40px", borderRadius: 16, fontWeight: 800 }} onClick={() => invokeAgent("research", product.id)}>
                          Reset Command Cycle
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
