import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

export async function POST() {
  try {
    // Force the absolute path to the root directory's Excel file
    const rootDir = "D:\\ez-internalagent"; 
    const filePath = path.join(rootDir, "leads.xlsx");
    
    console.log("🧹 WIPING DATASET AT:", filePath);

    // 1. Create a sanitized, empty workbook structure
    const headers = [["Business Name", "Category", "Phone", "Address", "Product Fit", "Scraped At"]];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    
    // 2. Clear any existing file first to break locks (if possible)
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (unlinkErr) {
            console.error("⚠️ File busy or locked. Overwriting instead.");
        }
    }

    // 3. Write binary to file to ensure cross-platform safety
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    fs.writeFileSync(filePath, buf);
    
    console.log("✅ DATASET WIPED SUCCESSFULLY.");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ CRITICAL WIPE FAILURE:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
