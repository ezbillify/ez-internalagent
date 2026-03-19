import { NextResponse } from "next/server";

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/ez-agent-control";

export async function POST() {
  try {
    await fetch(N8N_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pause_all" }),
    });
    return NextResponse.json({ success: true, message: "All agents paused" });
  } catch {
    return NextResponse.json({ error: "Failed to pause agents" }, { status: 500 });
  }
}
