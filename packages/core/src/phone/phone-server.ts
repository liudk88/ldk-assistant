import { WebSocketServer, type WebSocket } from 'ws';
import type {
  PhoneMessage,
  ServerToPhoneMessage,
  PhoneConnectionHandlers,
} from './types.js';

/**
 * 手机端 WebSocket 服务
 *
 * 职责：为手机端提供 WebSocket 连接，接收文字输入，推送结果
 */
export class PhoneServer {
  private wss: WebSocketServer | null = null;
  private handlers: PhoneConnectionHandlers;
  private clients: Set<WebSocket> = new Set();

  constructor(handlers: PhoneConnectionHandlers) {
    this.handlers = handlers;
  }

  /**
   * 启动手机端 WebSocket 服务
   * @param port - 监听端口
   */
  start(port: number): void {
    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    console.log(`PhoneServer started on port ${port}`);
  }

  /**
   * 停止服务，断开所有连接
   */
  stop(): void {
    if (this.wss) {
      this.clients.forEach((ws) => ws.close());
      this.wss.close();
      this.wss = null;
      this.clients.clear();
    }
  }

  /**
   * 当前连接的客户端数量
   */
  get clientCount(): number {
    return this.clients.size;
  }

  /**
   * 处理单个客户端连接
   * @param ws - WebSocket 连接
   */
  private handleConnection(ws: WebSocket): void {
    console.log('New phone client connected');
    this.clients.add(ws);

    ws.on('message', (data: Buffer) => {
      try {
        const message: PhoneMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        this.sendError(ws, `Invalid message format: ${error}`);
        this.handlers.onError(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    });

    ws.on('close', () => {
      console.log('Phone client disconnected');
      this.clients.delete(ws);
      this.handlers.onClose();
    });

    ws.on('error', (error: Error) => {
      console.error('Phone client error:', error);
      this.handlers.onError(error);
    });
  }

  /**
   * 解析手机端消息并路由
   * @param ws - WebSocket 连接
   * @param message - 手机端消息
   */
  private handleMessage(ws: WebSocket, message: PhoneMessage): void {
    switch (message.type) {
      case 'text-submit':
        console.log(`Text submitted: ${message.text}`);
        this.handlers.onTextSubmit(message.text);
        break;
      default:
        this.sendError(ws, `Unknown message type: ${(message as { type: string }).type}`);
    }
  }

  /**
   * 推送最终结果给手机端
   * @param ws - WebSocket 连接
   * @param intent - 用户意图
   * @param text - 处理后的文字
   */
  sendResult(ws: WebSocket, intent: 'input' | 'command', text: string): void {
    const message: ServerToPhoneMessage = {
      type: 'result',
      intent,
      text,
    };
    this.send(ws, message);
  }

  /**
   * 推送错误给手机端
   * @param ws - WebSocket 连接
   * @param errorMessage - 错误消息
   */
  sendError(ws: WebSocket, errorMessage: string): void {
    const message: ServerToPhoneMessage = {
      type: 'error',
      message: errorMessage,
    };
    this.send(ws, message);
  }

  /**
   * 发送消息给手机端
   * @param ws - WebSocket 连接
   * @param message - 服务端消息
   */
  private send(ws: WebSocket, message: ServerToPhoneMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}
