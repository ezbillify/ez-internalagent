"use client";

import { useState, useEffect } from "react";
import { Activity, Terminal, Cpu, Search, Zap, CheckCircle2, ArrowRight, Loader2, Globe, Database } from "lucide-react";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [readiness, setReadiness] = useState({ ollama: "checking", backend: "checking", models: "checking" });
    const [models, setModels] = useState<string[]>([]);

    useEffect(() => {
        const check = async () => {
            try {
                const ollamaRes = await fetch("http://localhost:11434/api/tags").catch(() => null);
                let modelList: string[] = [];
                if (ollamaRes) { const d = await ollamaRes.json(); modelList = d.models?.map((m: any) => m.name) || []; setModels(modelList); }
                const backendRes = await fetch("http://localhost:8000/status").catch(() => null);
                setReadiness({
                    ollama: ollamaRes ? "ready" : "error",
                    backend: backendRes ? "ready" : "error",
                    models: (modelList.some(m => m.includes("llama3.1")) && modelList.some(m => m.includes("qwen2.5-coder"))) ? "ready" : "pending"
                });
            } catch { }
        };
        check(); const i = setInterval(check, 5000); return () => clearInterval(i);
    }, []);

    const finalize = async () => {
        try {
            const r = await fetch("/api/products", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: "primary-cluster-01", name: "Executive Fleet Cluster", type: "orchestrator", repo: "ez-agent-hub/orchestrator", status: "online", lastSync: new Date().toISOString() })
            });
            if (r.ok) window.location.href = "/";
        } catch { window.location.href = "/"; }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ maxWidth: 720, width: "100%", background: "#fff", border: "1px solid #e0e0e0" }}>
                {/* Header */}
                <div style={{ padding: "32px 40px", background: "#161616", color: "#f4f4f4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#42be65" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#6f6f6f", textTransform: "uppercase", letterSpacing: "0.1em" }}>EZ Agent Hub v2.4</span>
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 400, lineHeight: 1.2 }}>System Onboarding</h1>
                    <p style={{ fontSize: 14, color: "#c6c6c6", marginTop: 8 }}>Initialize the autonomic intelligence pipeline.</p>
                </div>

                {/* Step Nav */}
                <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0" }}>
                    {[{ n: 1, l: "Environment" }, { n: 2, l: "Models" }, { n: 3, l: "Activate" }].map(s => (
                        <div key={s.n} style={{
                            flex: 1, padding: "14px 24px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
                            borderBottom: step === s.n ? "2px solid #0f62fe" : "2px solid transparent",
                            color: step === s.n ? "#0f62fe" : step > s.n ? "#198038" : "#a8a8a8"
                        }}>
                            {step > s.n ? <CheckCircle2 size={16} color="#198038" /> : <span style={{ width: 20, height: 20, borderRadius: "50%", background: step === s.n ? "#0f62fe" : "#e0e0e0", color: step === s.n ? "#fff" : "#6f6f6f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{s.n}</span>}
                            {s.l}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div style={{ padding: 40, minHeight: 320 }}>
                    {step === 1 && (
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Environment Readiness</h2>
                            {[
                                { label: "Ollama Cluster", desc: readiness.ollama === "ready" ? "Online (port 11434)" : "Checking…", icon: <Activity size={18} />, ready: readiness.ollama === "ready" },
                                { label: "Executive Backend", desc: readiness.backend === "ready" ? "Service online (port 8000)" : "Checking…", icon: <Terminal size={18} />, ready: readiness.backend === "ready" },
                            ].map((item, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#fafafa", border: "1px solid #e0e0e0", marginBottom: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ color: item.ready ? "#0f62fe" : "#a8a8a8" }}>{item.icon}</div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                                            <div style={{ fontSize: 12, color: "#6f6f6f" }}>{item.desc}</div>
                                        </div>
                                    </div>
                                    {item.ready ? <CheckCircle2 size={18} color="#198038" /> : <Loader2 size={18} color="#a8a8a8" className="animate-spin" />}
                                </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
                                <button className="btn btn-primary" disabled={readiness.ollama !== "ready" || readiness.backend !== "ready"} onClick={() => setStep(2)}>
                                    Next <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Cognitive Model Audit</h2>
                            <p style={{ fontSize: 13, color: "#525252", marginBottom: 24 }}>The fleet requires these models for technical analysis and market discovery.</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                {[
                                    { name: "Qwen 2.5 Coder 7B", role: "Technical Analysis", icon: <Cpu size={20} />, ready: models.some(m => m.includes("qwen2.5-coder")) },
                                    { name: "Llama 3.1 8B", role: "Market Discovery", icon: <Search size={20} />, ready: models.some(m => m.includes("llama3.1")) },
                                ].map((m, i) => (
                                    <div key={i} style={{ padding: 20, border: "1px solid #e0e0e0", background: m.ready ? "#defbe6" : "#fff" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, color: "#0f62fe" }}>{m.icon}{m.ready && <CheckCircle2 size={16} color="#198038" />}</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{m.name}</div>
                                        <div style={{ fontSize: 12, color: "#6f6f6f" }}>{m.role}</div>
                                    </div>
                                ))}
                            </div>
                            {readiness.models !== "ready" && (
                                <div style={{ marginTop: 20, padding: 16, background: "#fdf5df", border: "1px solid #f1c21b", display: "flex", gap: 12, alignItems: "flex-start" }}>
                                    <Zap size={16} color="#8e6a00" style={{ marginTop: 2 }} />
                                    <div style={{ fontSize: 13, color: "#8e6a00" }}>Required models are being pulled. This may take a few minutes.</div>
                                </div>
                            )}
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
                                <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                                <button className="btn btn-primary" disabled={readiness.models !== "ready"} onClick={() => setStep(3)}>Next <ArrowRight size={16} /></button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: "center" }}>
                            <div style={{ width: 64, height: 64, background: "#defbe6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                                <Globe size={32} color="#198038" />
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>System Ready</h2>
                            <p style={{ fontSize: 14, color: "#525252", maxWidth: 400, margin: "0 auto 32px", lineHeight: 1.6 }}>
                                The EZ Agent Hub cluster is synchronized and ready for administrative oversight.
                            </p>
                            <div style={{ display: "grid", gap: 8, maxWidth: 360, margin: "0 auto 32px" }}>
                                {["Fleet Monitoring: Enabled", "Research Loop: Active"].map((t, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fafafa", border: "1px solid #e0e0e0", textAlign: "left" }}>
                                        <CheckCircle2 size={16} color="#198038" />
                                        <span style={{ fontSize: 13, fontWeight: 500 }}>{t}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-primary" onClick={finalize} style={{ width: "100%", maxWidth: 280 }}>
                                Access Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
