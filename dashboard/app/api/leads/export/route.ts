import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "..", "leads.xlsx");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Leads file not found" }, { status: 404 });
    }

    const file = fs.readFileSync(filePath);
    
    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="leads.xlsx"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to download leads" }, { status: 500 });
  }
}
