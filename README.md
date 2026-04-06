# LDK Assistant - AI Agent Framework

企业级 AI Agent 框架 - 语音输入与对话系统

## 项目结构

```
ldk-assistant/
├── packages/
│   └── core/          # 核心框架代码
│       ├── src/
│       │   ├── intent/        # 意图分析
│       │   ├── phone/         # 手机端服务
│       │   ├── voice-input/   # 语音输入服务
│       │   └── index.ts
├── apps/
│   └── api/           # API 服务
│       └── src/
│           └── index.ts
├── doc/               # 设计文档
└── README.md
```

## v1 功能 - 手机文字输入

### 功能说明

通过手机浏览器访问本地网页，输入文字并提交，文字将自动注入到电脑光标位置。

### 系统依赖

本项目依赖以下系统工具，请提前安装：

#### Gentoo Linux
```bash
# 安装 ydotool（模拟键盘输入）
sudo emerge -av ydotool

# 安装 wl-clipboard（Wayland 剪贴板工具）
sudo emerge -av wl-clipboard
```

#### Arch Linux
```bash
sudo pacman -S ydotool wl-clipboard
```

#### Ubuntu/Debian
```bash
sudo apt install ydotool wl-clipboard
```

### 安装与运行

1. **安装 pnpm**（如果未安装）
```bash
npm install -g pnpm --prefix ~/.local
export PATH=$HOME/.local/bin:$PATH
```

2. **安装项目依赖**
```bash
pnpm install
```

3. **配置环境变量**（可选）
```bash
export HTTP_PORT=3000        # HTTP 服务端口，默认 3000
export WS_PORT=3001          # WebSocket 服务端口，默认 3001
export USER_UID=1000         # 用户 UID，默认 1000
```

4. **启动服务**
```bash
# 开发模式（使用 tsx 直接运行 TypeScript）
export PATH=$HOME/.local/bin:$PATH
pnpm dev

# 或者直接运行
node --import tsx apps/api/src/index.ts
```

5. **访问手机端网页**
- 打开手机浏览器，访问：`http://<电脑IP>:3000`
- 在输入框中输入文字或使用手机输入法的语音转文字
- 点击"提交"按钮
- 文字将自动注入到电脑光标位置

### 使用说明

#### 意图模式

- **输入模式**：文字前加"输入"前缀，或直接输入（默认模式）
  - 示例：`输入今天天气很好` → 电脑光标处出现"今天天气很好"
  - 示例：`今天天气很好` → 同上

- **指令模式**：文字前加"指令"前缀（v2 预留功能）
  - 示例：`指令打开微信` → 交给 Agent 编排层执行

#### 测试步骤

1. 在电脑上打开一个文本编辑器（如 gedit、vscode 等）
2. 将光标放在文本编辑器中
3. 手机浏览器打开 `http://<电脑IP>:3000`
4. 在输入框输入文字：`输入测试文字`
5. 点击"提交"按钮
6. 观察电脑文本编辑器中是否出现"测试文字"

### 开发规范

- TypeScript 严格模式
- 单个方法不超过 60 行
- 单一职责原则
- 参考文档：`doc/05-开发规范.md`

### 故障排查

#### ydotool 权限问题

如果遇到 ydotool 权限错误，需要确保：
1. ydotool 守护进程正在运行：`ydotoold`
2. 用户有权限访问 `/run/user/<uid>/ydotool.sock`

#### WebSocket 连接失败

- 确保防火墙允许端口 3000 和 3001
- 检查电脑和手机在同一局域网

### 技术栈

- **运行时**: Node.js 22+
- **开发语言**: TypeScript
- **Web 框架**: Fastify
- **WebSocket**: ws
- **包管理**: pnpm workspace

## 设计文档

- [01-系统架构.md](doc/01-系统架构.md) - 五层架构
- [02-功能架构.md](doc/02-功能架构.md) - 功能总览
- [03-技术路线图.md](doc/03-技术路线图.md) - 技术栈
- [05-开发规范.md](doc/05-开发规范.md) - 开发规范
- [06-协议层-模型适配器.md](doc/design/06-协议层-模型适配器.md) - 协议层设计
- [07-语音输入功能设计.md](doc/design/07-语音输入功能设计.md) - 语音输入详细设计

## License

MIT
