// dashboard/app/api/agent/status/route.ts
import { NextResponse } from "next/server";
import { dashboardStore } from "@/lib/store";

export async function GET() {
    return NextResponse.json(dashboardStore.getData());
}
