"use client";

import { useState } from "react";

const SETTINGS = [
  { id: "auto_file_bugs", label: "Auto-file bugs in EZ-Connect", default: true },
  { id: "discord_on_fail", label: "Send Discord alert on test failure", default: true },
  { id: "discord_on_pass", label: "Send Discord alert on test pass", default: false },
  { id: "auto_approve_research", label: "Auto-approve research feature cards", default: false },
  { id: "test_on_every_push", label: "Run tests on every push (all products)", default: true },
  { id: "report_to_github", label: "Push test reports to GitHub Actions", default: true },
  { id: "approve_p0_bugs", label: "Require approval before filing P0 bugs", default: false },
  { id: "lead_gen_daily", label: "Run lead gen daily at 6AM", default: true },
  { id: "research_weekly", label: "Run research agent weekly", default: true },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(Object.fromEntries(SETTINGS.map(s => [s.id, s.default])));
  const [ollamaModel, setOllamaModel] = useState("qwen2.5-coder:7b");
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => setSettings(prev => ({ ...prev, [id]: !prev[id] }));
  const save = async () => {
    try { await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings, ollamaModel }) }); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch { }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Agent Settings</h1>
          <p style={{ fontSize: 14, color: "#525252", marginTop: 4 }}>Configure agent behaviour and local LLM engine.</p>
        </div>
        <button className="btn btn-primary" onClick={save}>{saved ? "Saved ✓" : "Save Changes"}</button>
      </div>

      {/* LLM Engine */}
      <div className="section-label">Local LLM Engine</div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <label className="form-label">Inference Model</label>
              <select className="form-input" value={ollamaModel} onChange={e => setOllamaModel(e.target.value)}>
                <option value="qwen2.5-coder:7b">Qwen 2.5 Coder 7B</option>
                <option value="llama3.2:3b">Llama 3.2 3B</option>
                <option value="phi4:14b">Phi-4 14B</option>
              </select>
            </div>
            <div>
              <label className="form-label">Connectivity</label>
              <div style={{ height: 40, display: "flex", alignItems: "center", gap: 8, padding: "0 16px", background: "#fafafa", border: "1px solid #e0e0e0", fontSize: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#42be65" }} />
                <span style={{ fontWeight: 500 }}>Running at localhost:11434</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Behaviour Toggles */}
      <div className="section-label">Agent Behaviour</div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ padding: 0 }}>
          {SETTINGS.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #e0e0e0" }}>
              <span style={{ fontSize: 14 }}>{s.label}</span>
              <button onClick={() => toggle(s.id)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative",
                  background: settings[s.id] ? "#0f62fe" : "#c6c6c6", transition: "background 0.2s"
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3,
                  left: settings[s.id] ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="section-label">Danger Zone</div>
      <div className="card" style={{ borderColor: "#ffb3b8" }}>
        <div className="card-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#da1e28" }}>System Kill Switch</div>
              <div style={{ fontSize: 12, color: "#525252", marginTop: 2 }}>Terminates all active agent processes across the cluster.</div>
            </div>
            <button className="btn btn-danger">Execute Shutdown</button>
          </div>
          <div style={{ borderTop: "1px solid #ffb3b8", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Flush Queue</div>
              <div style={{ fontSize: 12, color: "#525252", marginTop: 2 }}>Removes all pending and scheduled tasks from the agent buffer.</div>
            </div>
            <button className="btn btn-secondary">Clear All Jobs</button>
          </div>
        </div>
      </div>
    </div>
  );
}
