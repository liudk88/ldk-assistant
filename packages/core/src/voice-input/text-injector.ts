import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { TextInjectorConfig } from './types.js';

const execAsync = promisify(exec);

/**
 * 文字注入电脑
 *
 * 职责：将文字注入到电脑当前焦点窗口
 * 实现方式：wl-copy 写入剪贴板 + ydotool 模拟 Ctrl+V
 */
export class TextInjector {
  private config: Required<TextInjectorConfig>;

  constructor(config: TextInjectorConfig) {
    this.config = {
      uid: config.uid,
      wlCopyPath: config.wlCopyPath ?? 'wl-copy',
      ydotoolPath: config.ydotoolPath ?? 'ydotool',
      pasteDelayMs: config.pasteDelayMs ?? 50,
      mockMode: config.mockMode ?? false,
    };
  }

  /**
   * 注入文字到当前焦点窗口
   * 流程：wl-copy → 等待 → ydotool Ctrl+V
   * @param text - 要注入的文字
   */
  async inject(text: string): Promise<void> {
    // 模拟模式：只打印日志，不实际注入
    if (this.config.mockMode) {
      console.log(`[TextInjector:MOCK] Would inject text: "${text}"`);
      return;
    }

    // 设置环境变量
    const env = {
      ...process.env,
      XDG_RUNTIME_DIR: `/run/user/${this.config.uid}`,
    };

    try {
      // 1. wl-copy 写入剪贴板
      await execAsync(`echo "${text}" | ${this.config.wlCopyPath}`, { env });

      // 2. 等待剪贴板写入完成
      await this.delay(this.config.pasteDelayMs);

      // 3. ydotool 模拟 Ctrl+V
      // key 29:1 是 Ctrl 按下，47:1 是 V 按下，47:0 是 V 松开，29:0 是 Ctrl 松开
      await execAsync(
        `${this.config.ydotoolPath} key 29:1 47:1 47:0 29:0`,
        { env },
      );
    } catch (error) {
      throw new Error(
        `Failed to inject text: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 替换模式（v2 预留）
   * 先选中当前内容再粘贴
   * @param text - 要替换的文字
   */
  async replace(text: string): Promise<void> {
    // v2 预留接口
    throw new Error('Replace mode is not implemented yet');
  }

  /**
   * 延迟函数
   * @param ms - 延迟毫秒数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
