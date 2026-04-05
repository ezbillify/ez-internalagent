// dashboard/app/api/agent/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dashboardStore } from "@/lib/store";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { product_id, report_type, data } = body;

        // Add to live log
        const status = data.status === "PASS" ? "ok" : (data.status === "FAIL" ? "err" : "info");
        dashboardStore.addLog(status, `📋 ${report_type.toUpperCase()} Report: ${product_id} — ${data.status || 'Received'}`, report_type);

        // Update metrics
        if (report_type === "qa") {
            dashboardStore.updateMetrics(m => ({ ...m, testsRun: m.testsRun + 1 }));
            dashboardStore.updateAgentMetrics("qa", (m: any) => ({ ...m, totalTests: m.totalTests + 1 }));
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
