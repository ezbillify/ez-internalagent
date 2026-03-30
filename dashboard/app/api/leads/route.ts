import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "..", "leads.xlsx");
    if (!fs.existsSync(filePath)) {
      console.log("⚠️ leads.xlsx not found at:", filePath);
      return NextResponse.json({ leads: [] });
    }

    // Use readFileSync + XLSX.read for better compatibility and avoiding file locks
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    const sheetName = workbook.SheetNames[0];
    const leads = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    return NextResponse.json({ leads });
  } catch (error: any) {
    console.error("❌ Failed to read leads:", error.message);
    return NextResponse.json({ error: `Failed to read leads: ${error.message}` }, { status: 500 });
  }
}
