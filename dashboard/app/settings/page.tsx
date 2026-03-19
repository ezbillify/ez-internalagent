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
  const [settings, setSettings] = useState(
    Object.fromEntries(SETTINGS.map((s) => [s.id, s.default]))
  );
  const [ollamaModel, setOllamaModel] = useState("qwen2.5-coder:7b");
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const save = async () => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, ollamaModel }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Agent settings</h1>
        <button className="btn btn-primary" onClick={save}>
          {saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      <div className="section-label">Local LLM</div>
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#888780", marginBottom: 4 }}>Ollama model</div>
            <select
              style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, background: "transparent", color: "inherit" }}
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
            >
              <option value="qwen2.5-coder:7b">qwen2.5-coder:7b (recommended — 16GB)</option>
              <option value="llama3.2:3b">llama3.2:3b (fast, lightweight)</option>
              <option value="phi4:14b">phi4:14b (smarter, slower)</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#888780", marginBottom: 4 }}>Ollama status</div>
            <div style={{ padding: "7px 10px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="pulse pulse-green" />
              Running at localhost:11434
            </div>
          </div>
        </div>
      </div>

      <div className="section-label">Agent behaviour</div>
      <div className="card">
        {SETTINGS.map((setting) => (
          <div key={setting.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
            <span style={{ flex: 1, fontSize: 13 }}>{setting.label}</span>
            <button
              className={`toggle ${settings[setting.id] ? "on" : ""}`}
              onClick={() => toggle(setting.id)}
            />
          </div>
        ))}
      </div>

      <div className="section-label">Danger zone</div>
      <div className="card" style={{ border: "0.5px solid #E24B4A" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Kill switch — stop all agents immediately</div>
            <div style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>Pauses all running and scheduled agents</div>
          </div>
          <button className="btn btn-danger">Stop all agents</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Clear all pending jobs</div>
            <div style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>Removes queued test runs</div>
          </div>
          <button className="btn btn-danger">Clear queue</button>
        </div>
      </div>
    </div>
  );
}
