#!/bin/bash

# LDK Assistant 启动脚本

# 设置 PATH（如果 pnpm 在 ~/.local/bin）
export PATH=$HOME/.local/bin:$PATH

# 检查依赖
echo "=== Checking dependencies ==="

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing..."
    npm install -g pnpm --prefix ~/.local
    export PATH=$HOME/.local/bin:$PATH
fi

# 检查系统工具
if [ "$MOCK_MODE" != "true" ]; then
    if ! command -v ydotool &> /dev/null; then
        echo "⚠️  ydotool not found. Text injection will not work."
        echo "   To enable mock mode for testing: export MOCK_MODE=true"
    fi

    if ! command -v wl-copy &> /dev/null; then
        echo "⚠️  wl-copy not found. Text injection will not work."
        echo "   To enable mock mode for testing: export MOCK_MODE=true"
    fi
fi

echo "✅ Dependencies checked"

# 安装项目依赖
echo "=== Installing dependencies ==="
pnpm install

# 启动服务
echo "=== Starting LDK Assistant ==="
export PATH=$HOME/.local/bin:$PATH
node --import tsx apps/api/src/index.ts
