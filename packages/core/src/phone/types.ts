import type { UserIntent } from '../intent/types.js';

/**
 * 手机端消息（手机 → 服务端）
 */
export type PhoneMessage =
  | { type: 'text-submit'; text: string };

/**
 * 服务端消息（服务端 → 手机端）
 */
export type ServerToPhoneMessage =
  | { type: 'result'; intent: UserIntent; text: string }
  | { type: 'error'; message: string };

/**
 * 手机端连接事件处理器
 */
export interface PhoneConnectionHandlers {
  /** 处理文字提交 */
  onTextSubmit: (text: string) => void;
  /** 处理连接关闭 */
  onClose: () => void;
  /** 处理错误 */
  onError: (error: Error) => void;
}
