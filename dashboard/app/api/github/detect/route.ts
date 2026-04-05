import { NextResponse } from "next/server";
import dotenv from "dotenv";
import path from "path";

// Load from root config
dotenv.config({ path: path.join(process.cwd(), "..", "config", ".env") });

// Detect stack/platform from a GitHub repository by inspecting its contents
export async function POST(req: Request) {
    try {
        const { repo } = await req.json();
        if (!repo) return NextResponse.json({ error: "repo is required" }, { status: 400 });

        // Normalize repo to owner/name format
        let ownerRepo = repo.trim();
        if (ownerRepo.startsWith("https://github.com/")) {
            ownerRepo = ownerRepo.replace("https://github.com/", "").replace(/\.git$/, "").replace(/\/$/, "");
        } else if (ownerRepo.startsWith("git@github.com:")) {
            ownerRepo = ownerRepo.replace("git@github.com:", "").replace(/\.git$/, "");
        }

        // Need at least owner/repo
        const parts = ownerRepo.split("/");
        if (parts.length < 2) {
            return NextResponse.json({ error: "Invalid repo format. Use owner/repo or full GitHub URL." }, { status: 400 });
        }
        ownerRepo = `${parts[0]}/${parts[1]}`;

        const token = process.env.GITHUB_AGENT_TOKEN;
        const headers: Record<string, string> = { "Accept": "application/vnd.github+json" };
        if (token && token !== "your_github_token_here") {
            headers["Authorization"] = `Bearer ${token}`;
        }


        // 1. Fetch repo metadata (name, description, language, topics)
        const repoRes = await fetch(`https://api.github.com/repos/${ownerRepo}`, { headers });

        if (!repoRes.ok) {
            const status = repoRes.status;
            if (status === 404) return NextResponse.json({ error: "Repository not found. Check the URL or ensure your GitHub token has access." }, { status: 404 });
            if (status === 401 || status === 403) return NextResponse.json({ error: "GitHub authentication failed. Check your GITHUB_AGENT_TOKEN in Settings." }, { status: 401 });
            return NextResponse.json({ error: `GitHub API error (${status})` }, { status: status });
        }

        const repoData = await repoRes.json();

        // 2. Fetch languages breakdown
        const langRes = await fetch(`https://api.github.com/repos/${ownerRepo}/languages`, { headers });
        const languages = langRes.ok ? await langRes.json() : {};

        // 3. Fetch root directory contents to detect config files
        const contentsRes = await fetch(`https://api.github.com/repos/${ownerRepo}/contents/`, { headers });
        const rootFiles: string[] = [];
        if (contentsRes.ok) {
            const contents = await contentsRes.json();
            if (Array.isArray(contents)) {
                contents.forEach((f: any) => rootFiles.push(f.name));
            }
        }

        // 4. Detect platform/framework based on file signatures
        const detection = detectPlatform(rootFiles, languages, repoData);

        return NextResponse.json({
            owner: parts[0],
            name: repoData.name,
            fullName: repoData.full_name,
            description: repoData.description,
            private: repoData.private,
            defaultBranch: repoData.default_branch,
            stars: repoData.stargazers_count,
            language: repoData.language,
            languages: Object.keys(languages),
            topics: repoData.topics || [],
            ...detection,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Detection failed" }, { status: 500 });
    }
}

function detectPlatform(
    files: string[],
    languages: Record<string, number>,
    repoData: any
): { type: string; framework: string; confidence: string; signals: string[] } {
    const signals: string[] = [];
    const has = (f: string) => files.includes(f);
    const langKeys = Object.keys(languages).map(l => l.toLowerCase());

    // Flutter / Dart
    if (has("pubspec.yaml")) {
        signals.push("pubspec.yaml detected");
        if (has("android") || files.some(f => f === "ios")) signals.push("android/ios directories found");
        return { type: "flutter", framework: "Flutter / Dart", confidence: "high", signals };
    }

    // Python
    if (has("requirements.txt") || has("setup.py") || has("pyproject.toml") || has("Pipfile")) {
        signals.push(has("requirements.txt") ? "requirements.txt" : has("pyproject.toml") ? "pyproject.toml" : "setup.py detected");
        if (has("manage.py")) { signals.push("manage.py → Django"); return { type: "python", framework: "Python / Django", confidence: "high", signals }; }
        if (has("app.py") || has("main.py")) { signals.push("app.py/main.py found"); return { type: "python", framework: "Python / FastAPI or Flask", confidence: "medium", signals }; }
        return { type: "python", framework: "Python", confidence: "high", signals };
    }

    // Node.js / JavaScript ecosystem (Next.js, React, Electron, etc.)
    if (has("package.json")) {
        signals.push("package.json detected");

        if (has("next.config.js") || has("next.config.ts") || has("next.config.mjs")) {
            signals.push("next.config found → Next.js");
            return { type: "nextjs", framework: "Next.js / React", confidence: "high", signals };
        }
        if (has("nuxt.config.js") || has("nuxt.config.ts")) {
            signals.push("nuxt.config found → Nuxt");
            return { type: "nuxtjs", framework: "Nuxt / Vue", confidence: "high", signals };
        }
        if (has("electron.js") || has("electron-builder.yml") || has("electron-builder.json5") || has("forge.config.js")) {
            signals.push("Electron config detected");
            return { type: "electron", framework: "Electron / Desktop", confidence: "high", signals };
        }
        if (has("vite.config.ts") || has("vite.config.js")) {
            signals.push("vite.config found");
            if (has("src")) signals.push("src/ directory");
            return { type: "vite", framework: "Vite / React or Vue", confidence: "medium", signals };
        }
        if (has("angular.json")) {
            signals.push("angular.json found");
            return { type: "angular", framework: "Angular", confidence: "high", signals };
        }
        if (has("svelte.config.js") || has("svelte.config.ts")) {
            signals.push("svelte.config found");
            return { type: "svelte", framework: "SvelteKit", confidence: "high", signals };
        }

        // Generic React (CRA or plain)
        if (langKeys.includes("typescript") || langKeys.includes("javascript")) {
            signals.push("JS/TS project with package.json");
            return { type: "nodejs", framework: "Node.js / JavaScript", confidence: "medium", signals };
        }
    }

    // Go
    if (has("go.mod") || has("go.sum")) {
        signals.push("go.mod detected");
        return { type: "go", framework: "Go", confidence: "high", signals };
    }

    // Rust
    if (has("Cargo.toml")) {
        signals.push("Cargo.toml detected");
        return { type: "rust", framework: "Rust", confidence: "high", signals };
    }

    // Ruby / Rails
    if (has("Gemfile")) {
        signals.push("Gemfile detected");
        if (has("config.ru") || has("Rakefile")) { signals.push("Rails signatures"); return { type: "ruby", framework: "Ruby on Rails", confidence: "high", signals }; }
        return { type: "ruby", framework: "Ruby", confidence: "medium", signals };
    }

    // Java / Spring / Gradle / Maven
    if (has("pom.xml") || has("build.gradle") || has("build.gradle.kts")) {
        signals.push(has("pom.xml") ? "pom.xml (Maven)" : "build.gradle (Gradle)");
        return { type: "java", framework: "Java / Spring", confidence: "medium", signals };
    }

    // Swift / iOS native
    if (files.some(f => f.endsWith(".xcodeproj") || f.endsWith(".xcworkspace"))) {
        signals.push("Xcode project detected");
        return { type: "swift", framework: "Swift / iOS Native", confidence: "high", signals };
    }

    // Fallback: use primary language from GitHub
    const primaryLang = repoData.language?.toLowerCase() || "unknown";
    signals.push(`Primary language: ${repoData.language || "undetected"}`);
    return { type: primaryLang, framework: repoData.language || "Unknown", confidence: "low", signals };
}
