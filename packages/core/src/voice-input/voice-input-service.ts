import type { WebSocket } from 'ws';
import { IntentAnalyzer } from '../intent/analyzer.js';
import { TextInjector } from './text-injector.js';
import type {
  VoiceInputResult,
  VoiceInputServiceConfig,
} from './types.js';

/**
 * 语音输入服务
 *
 * 职责：统一管理所有语音输入通道，调度意图分析，将结果分发到对应输出端
 */
export class VoiceInputService {
  private intentAnalyzer: IntentAnalyzer;
  private textInjector: TextInjector;
  private config: VoiceInputServiceConfig;

  constructor(config: VoiceInputServiceConfig) {
    this.config = config;

    // 初始化意图分析器
    this.intentAnalyzer = new IntentAnalyzer(config.intentAnalyzerConfig);

    // 初始化文字注入器
    this.textInjector = new TextInjector(config.textInjectorConfig);
  }

  /**
   * 处理文字输入（来自手机文字输入框）
   * @param text - 用户提交的文字
   * @param ws - WebSocket 连接（用于返回结果）
   *
   * 处理流程：
   * 1. 调用 IntentAnalyzer 分析意图
   * 2. 根据意图分发到对应输出端
   * 3. 回调 onResult
   */
  async handleTextInput(
    text: string,
    ws?: WebSocket,
  ): Promise<VoiceInputResult> {
    try {
      console.log(`[VoiceInputService] Handling text input: ${text}`);

      // 1. 意图分析
      const intentResult = await this.intentAnalyzer.analyze(text);
      console.log(
        `[VoiceInputService] Intent analyzed: ${intentResult.intent}, method: ${intentResult.method}`,
      );

      // 2. 构造结果
      const result: VoiceInputResult = {
        text: intentResult.content,
        intent: intentResult.intent,
        source: 'phone',
        timestamp: Date.now(),
      };

      // 3. 分发结果
      await this.dispatchResult(result, ws);

      // 4. 回调
      this.config.onResult(result);

      return result;
    } catch (error) {
      console.error('[VoiceInputService] Error handling text input:', error);
      throw error;
    }
  }

  /**
   * 意图分析完成后的分发
   * @param result - 语音输入结果
   * @param ws - WebSocket 连接（用于返回结果）
   */
  private async dispatchResult(
    result: VoiceInputResult,
    ws?: WebSocket,
  ): Promise<void> {
    const { intent, text } = result;

    switch (intent) {
      case 'input':
        // 输入模式：文字注入电脑光标位置
        console.log(`[VoiceInputService] Injecting text: ${text}`);
        await this.textInjector.inject(text);
        break;

      case 'command':
        // 指令模式：交给编排层执行（v2 预留）
        console.log(`[VoiceInputService] Command mode: ${text}`);
        console.log('[VoiceInputService] Command execution not implemented yet');
        break;

      default:
        console.warn(`[VoiceInputService] Unknown intent: ${intent}`);
    }
  }
}
