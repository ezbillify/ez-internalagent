// dashboard/app/api/agent/bugs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dashboardStore } from "@/lib/store";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { product_id, title, severity } = body;

        // Add to live log
        dashboardStore.addLog("err", `🐞 Bug filed: [${severity.toUpperCase()}] ${title} (${product_id})`, "qa");

        // Update metrics
        dashboardStore.updateMetrics(m => ({ ...m, bugsFiled: m.bugsFiled + 1 }));
        dashboardStore.updateAgentMetrics("qa", (m: any) => ({ ...m, totalTests: m.totalTests + 1 }));

        return NextResponse.json({ success: true, ticket_number: Math.floor(Math.random() * 9000) + 1000 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
