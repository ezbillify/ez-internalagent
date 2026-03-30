import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
  const STATUS_FILE = path.join(process.cwd(), "data", "live_status.json");

  try {
    // 1. Get ALL Models (Disk Inventory)
    const tagsRes = await fetch(`${OLLAMA_URL}/api/tags`).catch(() => null);
    const tagData = tagsRes?.ok ? await tagsRes.json() : { models: [] };
    const inventory = tagData.models || [];

    // 2. Get LIVE Models (RAM Stack)
    const psRes = await fetch(`${OLLAMA_URL}/api/ps`).catch(() => null);
    const psData = psRes?.ok ? await psRes.json() : { models: [] };
    const active = psData.models || [];

    // 3. Get Agent Status from live_status.json
    let agentsState: any[] = [];
    let logs: any[] = [];
    if (fs.existsSync(STATUS_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
      agentsState = data.agents || [];
      logs = data.logs || [];
    }

    // 4. Synthesize "Instant Activity"
    const activity = agentsState.map((a: any) => ({
      unit: `${a.id.toUpperCase()}_HB`,
      status: a.status,
      task: a.current_task,
      load: a.status === 'running' ? Math.floor(Math.random() * 40) + 60 : 0, // Simulated %
      time: a.last_run
    }));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      llm_stack: active.map((m: any) => ({
        name: m.name,
        size: (m.size / 1024 / 1024).toFixed(1) + " MB",
        status: "Currently Thinking (RAM)"
      })),
      inventory: inventory.map((m: any) => ({
        name: m.name,
        size: (m.size / 1024 / 1024).toFixed(1) + " MB",
        status: "System Ready (DISK)"
      })),
      agent_activity: activity,
      logs: logs.slice(0, 50) 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
