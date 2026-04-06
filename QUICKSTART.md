# 快速启动指南

## 服务已成功搭建 🎉

项目脚手架和手机文字输入功能已全部实现完成！

## 快速测试（模拟模式）

如果系统没有安装 `ydotool` 和 `wl-copy`，可以使用模拟模式测试：

```bash
export PATH=$HOME/.local/bin:$PATH
export MOCK_MODE=true
./start.sh
```

或者：

```bash
export PATH=$HOME/.local/bin:$PATH
export MOCK_MODE=true
node --import tsx apps/api/src/index.ts
```

## 完整功能测试

### 1. 安装系统依赖

#### Gentoo Linux
```bash
sudo emerge -av ydotool wl-clipboard
```

#### Arch Linux
```bash
sudo pacman -S ydotool wl-clipboard
```

#### Ubuntu/Debian
```bash
sudo apt install ydotool wl-clipboard
```

### 2. 启动 ydotool 守护进程（如果需要）

```bash
ydotoold
```

### 3. 启动服务

```bash
export PATH=$HOME/.local/bin:$PATH
./start.sh
```

### 4. 测试步骤

1. **打开文本编辑器**
   - 在电脑上打开 gedit、vscode 或任何文本编辑器
   - 将光标放在文本编辑器中

2. **访问手机端网页**
   - 手机浏览器访问：`http://<电脑IP>:3000`
   - 例如：`http://192.168.0.110:3000`

3. **输入文字测试**
   - 在输入框输入：`输入测试文字`
   - 点击"提交"按钮
   - 观察电脑文本编辑器中是否出现"测试文字"

4. **测试前缀词功能**
   - 输入：`输入今天天气很好` → 应该注入"今天天气很好"
   - 输入：`指令打开微信` → 应该显示指令模式（v2 功能）

## 功能说明

### 意图模式

- **输入模式**：
  - 前缀词：`输入` 或直接输入（默认）
  - 效果：文字注入到电脑光标位置

- **指令模式**：
  - 前缀词：`指令`
  - 效果：交给 Agent 编排层执行（v2 功能）

### 服务端口

- HTTP 服务：`3000`（手机端网页）
- WebSocket 服务：`3001`（手机端通信）

### 日志输出

服务运行时会输出详细日志：
- 连接状态
- 文字提交记录
- 意图分析结果
- 文字注入状态

## 项目结构

```
ldk-assistant/
├── packages/core/          # 核心框架
│   ├── src/
│   │   ├── intent/         # 意图分析器（前缀词匹配）
│   │   ├── phone/          # 手机端 WebSocket 服务
│   │   ├── voice-input/    # 语音输入服务（文字注入）
│   │   └── index.ts
├── apps/api/               # API 服务
│   └── src/
│       └── index.ts        # 启动入口
├── doc/                    # 设计文档
├── start.sh                # 启动脚本
└── README.md               # 详细说明
```

## 故障排查

### 端口被占用

```bash
# 查看端口占用
lsof -i :3000
lsof -i :3001

# 修改端口
export HTTP_PORT=8080
export WS_PORT=8081
```

### ydotool 权限问题

```bash
# 确保 ydotool 守护进程运行
ydotoold

# 检查用户 UID
id -u
export USER_UID=<你的UID>
```

### WebSocket 连接失败

- 确保防火墙允许端口 3000 和 3001
- 检查电脑和手机在同一局域网

## 下一步

- [ ] 安装 ASR 服务（FunASR）实现语音识别
- [ ] 实现电脑麦克风输入
- [ ] 实现 LLM 意图分析
- [ ] 实现指令模式执行

## 技术支持

- 查看设计文档：`doc/` 目录
- 查看开发规范：`doc/05-开发规范.md`
- 查看功能设计：`doc/design/07-语音输入功能设计.md`

---

**祝使用愉快！** 🚀
