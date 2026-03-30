import { NextResponse } from "next/server";

export async function GET() {
  const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
  const PRIMARY_MODEL = process.env.OLLAMA_MODEL || "phi3:mini";
  // The user is currently pulling these in background
  const TARGETS = [PRIMARY_MODEL, "qwen2.5-coder:7b", "llama3.2:1b", "tinyllama"];

  try {
    // 1. Get installed models
    const tagsRes = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!tagsRes.ok) throw new Error("Ollama server offline");
    const { models = [] } = await tagsRes.json();
    const installedModels = models.map((m: any) => m.name);

    // 2. Map status for each target
    const resultStatus = await Promise.all(TARGETS.map(async (model) => {
      // Check if fully installed
      if (installedModels.includes(model) || installedModels.some(m => m.startsWith(model))) {
        return { name: model, status: "ready", progress: 100 };
      }

      // Try to sample progress from pull stream
      try {
        const pullRes = await fetch(`${OLLAMA_URL}/api/pull`, {
          method: "POST",
          body: JSON.stringify({ name: model, stream: true }),
        });

        if (!pullRes.body) return { name: model, status: "waiting", progress: 0 };
        
        const reader = pullRes.body.getReader();
        let progress = 0;
        let pStatus = "initializing";

        // Read up to 5 chunks to find a percentage
        for (let i = 0; i < 8; i++) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunks = new TextDecoder().decode(value).split('\n');
          for (const chunk of chunks) {
            if (!chunk) continue;
            try {
              const data = JSON.parse(chunk);
              if (data.status?.includes("pulling")) {
                pStatus = "downloading";
                if (data.completed && data.total) {
                  const currentP = Math.round((data.completed / data.total) * 100);
                  if (currentP > progress) progress = currentP;
                }
              } else if (data.status === "verifying sha256") {
                progress = 99;
                pStatus = "verifying";
              } else if (data.status === "success") {
                progress = 100;
                pStatus = "ready";
              }
            } catch (e) {}
          }
          if (progress > 0) break; 
        }
        
        await reader.cancel(); 
        
        return { 
          name: model, 
          status: pStatus, 
          progress 
        };
      } catch (e) {
        return { name: model, status: "pending", progress: 0 };
      }
    }));

    return NextResponse.json({ 
      online: true, 
      models: resultStatus,
      active: resultStatus.find(s => s.status === "ready")?.name || null
    });

  } catch (err: any) {
    return NextResponse.json({ online: false, error: err.message }, { status: 200 });
  }
}
