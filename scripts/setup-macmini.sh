#!/bin/bash
# EZ Internal Agent — Mac Mini Setup Script
# Run once on your Mac Mini: bash scripts/setup-macmini.sh

set -e
echo "🚀 Setting up EZ Internal Agent on Mac Mini..."

# ── 1. Prevent sleep ──
echo "⚡ Configuring Mac Mini to never sleep..."
sudo pmset -a sleep 0
sudo pmset -a disksleep 0
sudo pmset -a displaysleep 15  # screen dims but system stays on
sudo pmset -a autorestart 1

# ── 2. Homebrew ──
if ! command -v brew &> /dev/null; then
    echo "🍺 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# ── 3. Ollama ──
if ! command -v ollama &> /dev/null; then
    echo "🤖 Installing Ollama..."
    brew install ollama
fi

echo "📦 Pulling Qwen2.5-Coder 7B (fits in 16GB)..."
ollama pull qwen2.5-coder:7b

echo "📦 Pulling Llama3.2 3B (for fast tasks)..."
ollama pull llama3.2:3b

# ── 4. Python ──
echo "🐍 Setting up Python..."
brew install python@3.11
pip3 install -r python/requirements.txt

# ── 5. Node.js (for Playwright) ──
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
fi

echo "📦 Installing Playwright..."
npx playwright install chromium

# ── 6. Maestro ──
if ! command -v maestro &> /dev/null; then
    echo "📱 Installing Maestro..."
    curl -Ls "https://get.maestro.mobile.dev" | bash
fi

# ── 7. n8n ──
if ! command -v n8n &> /dev/null; then
    echo "🔄 Installing n8n..."
    npm install -g n8n
fi

# ── 8. ADB (Android debug bridge) ──
brew install android-platform-tools

# ── 9. Set up launchd services (auto-start on boot) ──
echo "⚙️  Setting up auto-start services..."
mkdir -p /tmp/ez-agent-logs

# Ollama service
cp scripts/com.ezbillify.ollama.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.ezbillify.ollama.plist

# ── 10. Copy env file ──
if [ ! -f "config/.env" ]; then
    cp config/.env.example config/.env
    echo ""
    echo "⚠️  Fill in config/.env with your tokens before running agents"
fi

# ── 11. GitHub Actions self-hosted runner ──
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Fill in config/.env with your API keys"
echo "2. Set up GitHub Actions self-hosted runner:"
echo "   → Go to each repo → Settings → Actions → Runners → New self-hosted runner"
echo "   → Follow the Mac instructions"
echo "3. Import n8n/workflow.json into n8n (http://localhost:5678)"
echo "4. Connect your Android phone via USB + enable USB debugging"
echo "5. Connect your iPhone via USB + trust this Mac"
echo ""
echo "🎯 Then push any code change and watch the agents run!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
