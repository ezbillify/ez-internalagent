import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/ez-agent-control";
const N8N_SECRET = process.env.N8N_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  const { agent, product_id, action } = await req.json();

  try {
    const response = await fetch(N8N_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Agent-Secret": N8N_SECRET,
      },
      body: JSON.stringify({ agent, product_id, action }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "n8n trigger failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, agent, action: action || "trigger" });
  } catch (error) {
    return NextResponse.json({ error: "Could not reach n8n" }, { status: 500 });
  }
}
