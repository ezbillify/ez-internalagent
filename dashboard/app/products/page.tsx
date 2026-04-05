"use client";

import { useState, useEffect, useCallback } from "react";
import { Server, ExternalLink, Trash2, Loader2, CheckCircle2, AlertCircle, GitBranch } from "lucide-react";

type Product = { id: string; name: string; type: string; repo: string; framework?: string; status?: string; description?: string; private?: boolean; defaultBranch?: string; };
type Detection = { type: string; framework: string; confidence: string; signals: string[]; name?: string; description?: string; fullName?: string; private?: boolean; defaultBranch?: string; language?: string; languages?: string[]; stars?: number; owner?: string; error?: string; };

export default function FleetPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", type: "nextjs", repo: "" });
  const [detecting, setDetecting] = useState(false);
  const [detection, setDetection] = useState<Detection | null>(null);
  const [detectError, setDetectError] = useState<string | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try { const r = await fetch("/api/products"); if (r.ok) { const d = await r.json(); setProducts(d.products || []); } } catch { } finally { setLoading(false); }
  };

  const detectRepo = useCallback(async (repoUrl: string) => {
    if (!repoUrl || repoUrl.length < 3) { setDetection(null); setDetectError(null); return; }
    // Only detect if it looks like a valid repo reference
    const trimmed = repoUrl.trim();
    const isGitHub = trimmed.includes("github.com/") || (trimmed.includes("/") && !trimmed.startsWith("/") && trimmed.split("/").length >= 2);
    if (!isGitHub) return;

    setDetecting(true);
    setDetection(null);
    setDetectError(null);

    try {
      const r = await fetch("/api/github/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: trimmed }),
      });
      const data = await r.json();
      if (!r.ok) {
        setDetectError(data.error || "Detection failed");
      } else {
        setDetection(data);
        // Auto-fill form fields from detection
        setForm(prev => ({
          ...prev,
          type: data.type || prev.type,
          name: prev.name || data.name || "",
        }));
      }
    } catch (err: any) {
      setDetectError("Failed to connect to GitHub API");
    } finally {
      setDetecting(false);
    }
  }, []);

  // Debounce repo detection
  const [debounceTimer, setDebounceTimer] = useState<any>(null);
  const handleRepoChange = (val: string) => {
    setForm(prev => ({ ...prev, repo: val }));
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => detectRepo(val), 800));
  };

  const handleAdd = async () => {
    if (!form.repo || !form.name) return;
    setLoading(true);
    try {
      const id = form.name.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).substring(2, 5);
      const payload: any = {
        ...form, id, status: "online", lastSync: new Date().toISOString(),
        framework: detection?.framework || form.type,
        description: detection?.description || "",
        private: detection?.private || false,
        defaultBranch: detection?.defaultBranch || "main",
      };
      const r = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (r.ok) {
        setForm({ name: "", type: "nextjs", repo: "" });
        setDetection(null);
        setDetectError(null);
        setShowAdd(false);
        fetchProducts();
      }
    } catch { } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Decommission this node from the fleet registry?")) return;
    try { const r = await fetch(`/api/products?id=${id}`, { method: "DELETE" }); if (r.ok) fetchProducts(); } catch { }
  };

  const getGitHubUrl = (repo: string) => {
    if (repo.startsWith("https://github.com/")) return repo;
    if (repo.includes("/") && !repo.startsWith("/")) return `https://github.com/${repo}`;
    return null;
  };

  const confidenceColor: any = { high: "#198038", medium: "#8e6a00", low: "#da1e28" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Fleet Provisioning</h1>
          <p style={{ fontSize: 14, color: "#525252", marginTop: 4 }}>Add GitHub repositories — the system auto-detects the stack and framework.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(!showAdd); setDetection(null); setDetectError(null); }}>
          {showAdd ? "Cancel" : "Provision Node"}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header" style={{ borderBottom: "1px solid #e0e0e0" }}>New Node — Paste a GitHub URL to auto-detect</div>
          <div className="card-body">
            {/* Repo URL Input */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">GitHub Repository</label>
              <div style={{ position: "relative" }}>
                <input className="form-input" value={form.repo}
                  onChange={e => handleRepoChange(e.target.value)}
                  placeholder="https://github.com/your-org/your-repo  or  your-org/your-repo"
                  style={{ paddingRight: 40, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }} />
                {detecting && (
                  <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
                    <Loader2 size={16} className="animate-spin" color="#0f62fe" />
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#6f6f6f", marginTop: 4 }}>
                Accepts full URL or shorthand (org/repo). Private repos require GITHUB_AGENT_TOKEN.
              </div>
            </div>

            {/* Detection Result */}
            {detectError && (
              <div style={{ padding: "12px 16px", background: "#fff1f1", border: "1px solid #ffb3b8", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <AlertCircle size={16} color="#da1e28" />
                <span style={{ fontSize: 13, color: "#da1e28" }}>{detectError}</span>
              </div>
            )}

            {detection && !detectError && (
              <div style={{ padding: 20, background: "#fafafa", border: "1px solid #e0e0e0", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={18} color="#198038" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Repository Detected</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: confidenceColor[detection.confidence] || "#525252", textTransform: "uppercase", padding: "2px 8px", background: detection.confidence === "high" ? "#defbe6" : detection.confidence === "medium" ? "#fdf5df" : "#fff1f1" }}>
                    {detection.confidence} confidence
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#6f6f6f", textTransform: "uppercase", marginBottom: 4 }}>Repository</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{detection.fullName || detection.name}</div>
                    {detection.description && <div style={{ fontSize: 12, color: "#525252", marginTop: 2 }}>{detection.description}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#6f6f6f", textTransform: "uppercase", marginBottom: 4 }}>Detected Framework</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0f62fe" }}>{detection.framework}</div>
                    <div style={{ fontSize: 12, color: "#525252", marginTop: 2 }}>Type: {detection.type}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#6f6f6f", textTransform: "uppercase", marginBottom: 4 }}>Details</div>
                    <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 2 }}>
                      <span>{detection.private ? "🔒 Private" : "🌐 Public"} · ⭐ {detection.stars ?? "—"}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><GitBranch size={12} /> {detection.defaultBranch || "main"}</span>
                    </div>
                  </div>
                </div>

                {/* Detection Signals */}
                <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6f6f6f", textTransform: "uppercase", marginBottom: 6 }}>Detection Signals</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {detection.signals.map((s, i) => (
                      <span key={i} style={{ fontSize: 11, padding: "2px 8px", background: "#e0e0e0", color: "#161616" }}>{s}</span>
                    ))}
                    {(detection.languages || []).map((l, i) => (
                      <span key={`l${i}`} style={{ fontSize: 11, padding: "2px 8px", background: "#d0e2ff", color: "#0043ce" }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Name + Type (auto-filled but editable) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Node Name {detection && <span style={{ color: "#198038", fontSize: 11 }}>(auto-filled)</span>}</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. EZ-Dine Mobile App" />
              </div>
              <div>
                <label className="form-label">Stack Profile {detection && <span style={{ color: "#198038", fontSize: 11 }}>(auto-detected)</span>}</label>
                <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="nextjs">Next.js</option>
                  <option value="flutter">Flutter</option>
                  <option value="python">Python</option>
                  <option value="electron">Electron</option>
                  <option value="vite">Vite / React</option>
                  <option value="nuxtjs">Nuxt / Vue</option>
                  <option value="angular">Angular</option>
                  <option value="svelte">SvelteKit</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="ruby">Ruby / Rails</option>
                  <option value="java">Java / Spring</option>
                  <option value="swift">Swift / iOS</option>
                  <option value="nodejs">Node.js</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => { setShowAdd(false); setDetection(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={loading || !form.name || !form.repo}>
                {detection ? "Provision Detected Node" : "Provision"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cluster Table */}
      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Server size={16} /> Cluster Inventory</span>
          <span style={{ fontSize: 12, color: "#525252" }}>{products.length} node{products.length !== 1 ? "s" : ""}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Node ID</th>
              <th>Name</th>
              <th>Stack</th>
              <th>Repository</th>
              <th>Health</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const ghUrl = getGitHubUrl(p.repo);
              return (
                <tr key={p.id}>
                  <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#525252" }}>{p.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 12, color: "#6f6f6f", marginTop: 2 }}>{p.description}</div>}
                  </td>
                  <td>
                    <span className="tag tag-blue">{p.framework || p.type}</span>
                  </td>
                  <td>
                    {ghUrl ? (
                      <a href={ghUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: "#0f62fe", textDecoration: "none", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        {p.repo} <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#525252" }}>{p.repo}</span>
                    )}
                  </td>
                  <td><span className="tag tag-green">Online</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button onClick={() => handleDelete(p.id)}
                      style={{ background: "none", border: "none", color: "#da1e28", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Trash2 size={14} /> Decommission
                    </button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && !loading && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "#525252", padding: 32 }}>No active nodes. Provision one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
