// dashboard/app/api/agent/leads/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dashboardStore } from "@/lib/store";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const leadsCount = Array.isArray(body) ? body.length : (body.leads?.length || 0);

        // Add to live log
        dashboardStore.addLog("ok", `🎯 Lead Gen: Scraped and pushed ${leadsCount} leads to CRM.`, "leads");

        // Update metrics
        dashboardStore.updateMetrics(m => ({ ...m, leadsToday: m.leadsToday + leadsCount }));
        dashboardStore.updateAgentMetrics("leads", (m: any) => ({ ...m, totalLeads: m.totalLeads + leadsCount }));

        return NextResponse.json({ success: true, count: leadsCount });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
