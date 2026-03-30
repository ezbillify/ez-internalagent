import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export async function POST(req: Request) {
  try {
    const { agent, product } = await req.json();
    
    // Build command e.g. python python/agent.py research --product ezbillify-web
    const pythonPath = "python"; // Assume python is in PATH
    const scriptPath = path.join(process.cwd(), "..", "python", "agent.py");
    
    let command = `${pythonPath} ${scriptPath} ${agent}`;
    if (product) {
      command += ` --product ${product}`;
    }

    console.log(`🚀 Invoking agent: ${command}`);
    
    // Run in background for performance
    exec(command, { cwd: path.join(process.cwd(), "..") });

    return NextResponse.json({ success: true, message: `Agent ${agent} triggered for ${product || 'all'}` });
  } catch (error) {
    console.error(`❌ Agent invocation failed:`, error);
    return NextResponse.json({ error: "Failed to trigger agent" }, { status: 500 });
  }
}
