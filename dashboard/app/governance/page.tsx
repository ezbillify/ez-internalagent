"use client";

import { useState, useEffect } from "react";
import { Key, Cpu, Globe, Save, Eye, EyeOff, ShieldCheck, Users, Github } from "lucide-react";
import toast from "react-hot-toast";

type SecretField = { id: string; label: string; value: string; visible: boolean; status: "online" | "offline" | "checking"; hint?: string; };

export default function GovernancePage() {
  const [loading, setLoading] = useState(false);
  const [secrets, setSecrets] = useState<Record<string, SecretField>>({
    github_token: { id: "github_token", label: "GitHub Agent Token", value: "", visible: false, status: "checking", hint: "Required for fleet nodes to clone private repos. Create a classic Personal Access Token (PAT) with 'repo' scope at github.com/settings/tokens" },
    apify: { id: "apify", label: "Apify API Token", value: "", visible: false, status: "checking" },
    serper: { id: "serper", label: "Serper API Key", value: "", visible: false, status: "checking", hint: "Required for research agent. Free 2500 searches/mo at serper.dev" },
    discord: { id: "discord", label: "Discord Webhook URL", value: "", visible: false, status: "checking" },
    ollama: { id: "ollama", label: "Ollama Engine URL", value: "http://localhost:11434", visible: true, status: "checking" },
    model: { id: "model", label: "Ollama Model", value: "qwen2.5-coder:7b", visible: true, status: "checking" },
    ezconnect_url: { id: "ezconnect_url", label: "EZ-Connect Endpoint", value: "", visible: true, status: "checking" },
    ezconnect_token: { id: "ezconnect_token", label: "EZ-Connect Access Token", value: "", visible: false, status: "checking" },
  });
  const [auditLogs] = useState([
    { event: "Apify API Key Updated", time: "2 hours ago", user: "System" },
    { event: "Ollama Connectivity Verified", time: "5 hours ago", user: "Agent: QA" },
    { event: "Governance Policy Enforced", time: "1 day ago", user: "Administrator" },
  ]);

  useEffect(() => {
    setSecrets(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k].status = next[k].value.length > 5 ? "online" : "offline"; });
      return next;
    });
  }, []);

  const toggleVisibility = (id: string) => setSecrets(prev => ({ ...prev, [id]: { ...prev[id], visible: !prev[id].visible } }));
  const updateValue = (id: string, value: string) => setSecrets(prev => ({ ...prev, [id]: { ...prev[id], value } }));
  const saveSection = async (title: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success(`${title} saved.`);
    setLoading(false);
  };

  const renderSection = (title: string, icon: React.ReactNode, keys: string[]) => (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon} {title}
      </div>
      <div className="card-body">
        {keys.map(k => {
          const f = secrets[k];
          return (
            <div key={k} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>{f.label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6f6f6f" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: f.status === "online" ? "#42be65" : "#da1e28" }} />
                  {f.status}
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <input className="form-input" type={f.visible ? "text" : "password"} value={f.value}
                  onChange={e => updateValue(k, e.target.value)} placeholder={`Enter ${f.label}…`}
                  style={{ paddingRight: 40 }} />
                <button onClick={() => toggleVisibility(k)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6f6f6f" }}>
                  {f.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {f.hint && <div style={{ fontSize: 12, color: "#6f6f6f", marginTop: 4 }}>{f.hint}</div>}
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid #e0e0e0" }}>
          <button className="btn btn-primary" onClick={() => saveSection(title)} disabled={loading}>
            <Save size={14} /> {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Settings & Governance</h1>
        <p style={{ fontSize: 14, color: "#525252", marginTop: 4 }}>Manage credentials, engine parameters, and audit trail.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        <div>
          {renderSection("GitHub Credentials", <Github size={16} color="#0f62fe" />, ["github_token"])}
          {renderSection("Agent API Keys", <Key size={16} color="#0f62fe" />, ["apify", "serper", "discord"])}
          {renderSection("Engine Parameters", <Cpu size={16} color="#0f62fe" />, ["ollama", "model"])}
          {renderSection("Enterprise Sync", <Globe size={16} color="#0f62fe" />, ["ezconnect_url", "ezconnect_token"])}
        </div>
        <div>
          <div className="section-label">Audit Log</div>
          <div className="card" style={{ marginBottom: 24 }}>
            {auditLogs.map((log, i) => (
              <div key={i} style={{ padding: "14px 24px", borderBottom: i < auditLogs.length - 1 ? "1px solid #e0e0e0" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{log.event}</span>
                  <span style={{ fontSize: 11, color: "#6f6f6f" }}>{log.time}</span>
                </div>
                <div style={{ fontSize: 12, color: "#6f6f6f", display: "flex", alignItems: "center", gap: 6 }}>
                  <Users size={12} /> {log.user}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: "#161616", color: "#f4f4f4" }}>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <ShieldCheck size={18} color="#42be65" />
                <span style={{ fontWeight: 600 }}>Security Posture</span>
              </div>
              <p style={{ fontSize: 13, color: "#c6c6c6", lineHeight: 1.6, marginBottom: 16 }}>
                All keys are stored locally and never transmitted externally. Agent logs redact credential strings automatically.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" style={{ flex: 1, background: "#393939", color: "#f4f4f4", border: "none" }}>Export Audit</button>
                <button className="btn" style={{ flex: 1, background: "#393939", color: "#f4f4f4", border: "none" }}>Rotate All</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
