#!/bin/bash

# LDK Assistant 启动脚本

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 如果在容器内且宿主机有 nsenter，自动设置 HOST_EXEC_PREFIX
if [ -z "$HOST_EXEC_PREFIX" ] && command -v nsenter &>/dev/null && [ "$(cat /proc/1/cgroup 2>/dev/null | head -1)" != "" ]; then
    export HOST_EXEC_PREFIX="nsenter -t 1 -m -u -i -n --"
    echo "📦 Running in container, host commands will use: $HOST_EXEC_PREFIX"
fi

# 检查宿主机工具（通过 nsenter）
check_host_tool() {
    local cmd="$1"
    if [ -n "$HOST_EXEC_PREFIX" ]; then
        nsenter -t 1 -m -u -i -n -p -- which "$cmd" &>/dev/null
    else
        command -v "$cmd" &>/dev/null
    fi
}

if [ "$MOCK_MODE" != "true" ]; then
    for tool in ydotool wl-copy; do
        if ! check_host_tool "$tool"; then
            echo "⚠️  $tool not found on host. Text injection will not work."
            echo "   To enable mock mode for testing: MOCK_MODE=true $0"
        fi
    done
fi

echo "=== Starting LDK Assistant ==="
echo "MOCK_MODE: ${MOCK_MODE:-false}"
echo "HOST_EXEC_PREFIX: ${HOST_EXEC_PREFIX:-(none, running on host)}"

node --import tsx apps/api/src/index.ts
