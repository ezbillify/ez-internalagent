"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Key, 
  Settings, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Globe,
  MessageSquare,
  Activity,
  History,
  Terminal,
  Cpu,
  Users
} from "lucide-react";
import toast from "react-hot-toast";

type SecretField = {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  status: "online" | "offline" | "checking";
};

export default function GovernancePage() {
  const [loading, setLoading] = useState(false);
  const [secrets, setSecrets] = useState<Record<string, SecretField>>({
    apify: { id: "apify", label: "Apify API Token", value: "", visible: false, status: "checking" },
    discord: { id: "discord", label: "Discord Webhook URL", value: "", visible: false, status: "checking" },
    ollama: { id: "ollama", label: "Ollama Engine URL", value: "http://localhost:11434", visible: true, status: "checking" },
    model: { id: "model", label: "Ollama Model", value: "qwen2.5-coder:7b", visible: true, status: "checking" },
    ezconnect_url: { id: "ezconnect_url", label: "EZ-Connect Endpoint", value: "", visible: true, status: "checking" },
    ezconnect_token: { id: "ezconnect_token", label: "EZ-Connect Access Token", value: "", visible: false, status: "checking" },
  });

  const [auditLogs, setAuditLogs] = useState([
    { event: "Apify API Key Updated", time: "2 hours ago", user: "System" },
    { event: "Ollama Connectivity Verified", time: "5 hours ago", user: "Agent: QA" },
    { event: "Governance Policy Enforced", time: "1 day ago", user: "Administrator" },
  ]);

  useEffect(() => {
    // Simulated health check
    const checkHealth = () => {
      setSecrets(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (next[key].value.length > 5) next[key].status = "online";
          else next[key].status = "offline";
        });
        return next;
      });
    };
    checkHealth();
  }, []);

  const toggleVisibility = (id: string) => {
    setSecrets(prev => ({
      ...prev,
      [id]: { ...prev[id], visible: !prev[id].visible }
    }));
  };

  const updateValue = (id: string, value: string) => {
    setSecrets(prev => ({
      ...prev,
      [id]: { ...prev[id], value }
    }));
  };

  const saveSection = async (title: string, keys: string[]) => {
    setLoading(true);
    // Simulated save to /api/governance
    await new Promise(r => setTimeout(r, 1000));
    toast.success(`${title} saved successfully. Agents notified.`);
    setLoading(false);
    
    setAuditLogs(prev => [
      { event: `${title} updated`, time: "Just now", user: "Administrator" },
      ...prev
    ]);
  };

  const renderSection = (title: string, icon: any, keys: string[]) => (
    <div className="card" style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "var(--bg-enterprise)", padding: 8, borderRadius: 6 }}>
          {icon}
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h2>
          <p style={{ fontSize: 12, color: "var(--slate-muted)" }}>Manage decentralized credentials for background agents</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {keys.map(k => {
          const field = secrets[k];
          return (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>{field.label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ 
                    width: 6, height: 6, borderRadius: "50%", 
                    background: field.status === "online" ? "#10b981" : "#ef4444" 
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--slate-muted)", textTransform: "uppercase" }}>
                    {field.status}
                  </span>
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <input 
                  type={field.visible ? "text" : "password"}
                  value={field.value}
                  onChange={(e) => updateValue(k, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 12px",
                    fontSize: 14,
                    borderRadius: 6,
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-enterprise)",
                    fontFamily: !field.visible ? "initial" : "'JetBrains Mono', monospace"
                  }}
                  placeholder={`Enter ${field.label}...`}
                />
                <button 
                  onClick={() => toggleVisibility(k)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--slate-muted)" }}
                >
                  {field.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end" }}>
        <button 
          className="btn btn-primary" 
          style={{ gap: 8 }}
          disabled={loading}
          onClick={() => saveSection(title, keys)}
        >
          <Save size={14} /> {loading ? "Syncing..." : "Save Changes"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <header className="page-header">
        <div>
          <h1 className="page-title">Governance & Oversight</h1>
          <p style={{ fontSize: 13, color: "var(--slate-muted)", marginTop: 4 }}>Administrative management of autonomous credentials and engine parameters</p>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32 }}>
        <div>
          {renderSection("Autonomous Credentials", <Key size={20} color="var(--primary-enterprise)" />, ["apify", "discord"])}
          {renderSection("Engine Parameters", <Cpu size={20} color="var(--primary-enterprise)" />, ["ollama", "model"])}
          {renderSection("Enterprise Sync", <Globe size={20} color="var(--primary-enterprise)" />, ["ezconnect_url", "ezconnect_token"])}
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--slate-muted)", textTransform: "uppercase", marginBottom: 16 }}>System Audit Log</div>
          <div className="card" style={{ padding: 0 }}>
            {auditLogs.map((log, i) => (
              <div key={i} style={{ 
                padding: "16px 20px", 
                borderBottom: i === auditLogs.length - 1 ? "none" : "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: 4
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{log.event}</span>
                  <span style={{ fontSize: 11, color: "var(--slate-muted)" }}>{log.time}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Users size={12} color="var(--slate-muted)" />
                  <span style={{ fontSize: 12, color: "var(--slate-muted)" }}>{log.user}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 32, background: "var(--slate-strong)", color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <ShieldCheck size={20} color="#10b981" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Security Posture</h3>
            </div>
            <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5, marginBottom: 20 }}>
              All keys are stored locally in the EZ Agent environment and are never transmitted to EZ-Internal servers. 
              Agent logs redact sensitive credential strings automatically.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn" style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", flex: 1 }}>Export Audit</button>
              <button className="btn" style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", flex: 1 }}>Rotate All</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
