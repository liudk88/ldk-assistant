/**
 * LDK Assistant - API 服务启动入口
 *
 * 职责：
 * 1. 初始化 Fastify HTTP 服务（提供手机端网页）
 * 2. 初始化 PhoneServer WebSocket 服务（接收手机端文字输入）
 * 3. 初始化 VoiceInputService（总调度）
 */

import fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { PhoneServer } from '@ldk-assistant/core/phone';
import { VoiceInputService } from '@ldk-assistant/core/voice-input';
import type { WebSocket } from 'ws';

// 配置
const HTTP_PORT = Number.parseInt(process.env.HTTP_PORT ?? '3000', 10);
const WS_PORT = Number.parseInt(process.env.WS_PORT ?? '3001', 10);
const USER_UID = Number.parseInt(process.env.USER_UID ?? '1000', 10);
const MOCK_MODE = process.env.MOCK_MODE === 'true';

/**
 * 获取手机端网页 HTML
 */
function getPhonePageHtml(): string {
  // 支持环境变量覆盖，默认从 core 包的源码目录读取
  const envPath = process.env.PHONE_HTML_PATH;
  if (envPath) {
    return readFileSync(envPath, 'utf-8');
  }

  // 尝试相对于 import.meta.url 解析
  const metaPath = fileURLToPath(
    new URL('../../packages/core/src/phone/static/index.html', import.meta.url),
  );

  // 兜底：相对于 process.cwd() 从项目根查找
  const cwdPath = 'packages/core/src/phone/static/index.html';

  for (const p of [metaPath, cwdPath]) {
    try {
      return readFileSync(p, 'utf-8');
    } catch {
      // 继续尝试下一个
    }
  }

  throw new Error(
    `Cannot find phone/index.html. Tried:\n  ${metaPath}\n  ${cwdPath}\n  Set PHONE_HTML_PATH env var to override.`,
  );
}

/**
 * 主函数
 */
async function main() {
  console.log('=== LDK Assistant Starting ===');
  console.log(`HTTP Port: ${HTTP_PORT}`);
  console.log(`WS Port: ${WS_PORT}`);
  console.log(`User UID: ${USER_UID}`);
  console.log(`Mock Mode: ${MOCK_MODE ? 'enabled (testing)' : 'disabled (production)'}`);

  // 1. 初始化 VoiceInputService
  const voiceInputService = new VoiceInputService({
    intentAnalyzerConfig: {
      prefixes: {
        input: ['输入'],
        command: ['指令'],
      },
    },
    textInjectorConfig: {
      uid: USER_UID,
      wlCopyPath: 'wl-copy',
      ydotoolPath: 'ydotool',
      pasteDelayMs: 50,
      mockMode: MOCK_MODE,
    },
    onResult: (result) => {
      console.log(`[VoiceInputService] Result:`, result);
    },
  });

  // 2. 初始化 PhoneServer
  const phoneServer = new PhoneServer({
    onTextSubmit: async (text: string) => {
      console.log(`[PhoneServer] Text submitted: ${text}`);

      try {
        // 处理文字输入
        await voiceInputService.handleTextInput(text);
      } catch (error) {
        console.error('[PhoneServer] Error handling text submit:', error);
        throw error;
      }
    },
    onClose: () => {
      console.log('[PhoneServer] Client disconnected');
    },
    onError: (error: Error) => {
      console.error('[PhoneServer] Error:', error);
    },
  });

  // 3. 启动 PhoneServer WebSocket 服务
  phoneServer.start(WS_PORT);

  // 4. 初始化 Fastify HTTP 服务
  const app = fastify({
    logger: true,
  });

  // 注册 WebSocket 插件
  await app.register(websocketPlugin);

  // 静态资源路由 - 手机端网页
  app.get('/', async (request, reply) => {
    reply.type('text/html').send(getPhonePageHtml());
  });

  // 健康检查
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      phoneClients: phoneServer.clientCount,
    };
  });

  // 5. 启动 HTTP 服务
  try {
    await app.listen({ port: HTTP_PORT, host: '0.0.0.0' });
    console.log(`HTTP server started on port ${HTTP_PORT}`);
    console.log(`Phone page available at http://0.0.0.0:${HTTP_PORT}`);
  } catch (error) {
    console.error('Failed to start HTTP server:', error);
    process.exit(1);
  }

  // 优雅退出
  const shutdown = async () => {
    console.log('Shutting down...');
    phoneServer.stop();
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// 启动服务
main().catch((error) => {
  console.error('Failed to start:', error);
  process.exit(1);
});
