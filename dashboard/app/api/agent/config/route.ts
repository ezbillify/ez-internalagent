// dashboard/app/api/agent/config/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    // Simple config for agents
    return NextResponse.json({
        interval_qa: 300,
        interval_research: 86400 * 7,
        interval_leads: 86400,
        is_live: true
    });
}
