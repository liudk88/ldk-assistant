import type {
  IntentResult,
  IntentAnalyzerConfig,
  UserIntent,
} from './types.js';

/**
 * 意图分析器
 *
 * 职责：接收文字，判断用户意图是输入模式还是指令模式
 * v1 实现：只支持前缀词匹配，不支持 LLM 分析
 */
export class IntentAnalyzer {
  private config: IntentAnalyzerConfig;

  constructor(config: IntentAnalyzerConfig) {
    this.config = config;
  }

  /**
   * 分析用户意图
   * @param text - ASR 识别结果 或 手机端提交的文字
   * @returns IntentResult
   *
   * 处理流程：
   * 1. 遍历前缀词列表，匹配成功直接返回（method='prefix'）
   * 2. 前缀词未命中 → 默认返回 input 模式（method='prefix'，兜底逻辑）
   */
  async analyze(text: string): Promise<IntentResult> {
    // 尝试前缀词匹配
    const prefixMatch = this.matchPrefix(text);
    if (prefixMatch) {
      return {
        intent: prefixMatch.intent,
        content: prefixMatch.content,
        confidence: 1.0,
        method: 'prefix',
      };
    }

    // 兜底：没有前缀词时，默认为输入模式
    return {
      intent: 'input',
      content: text,
      confidence: 0.5,
      method: 'prefix',
    };
  }

  /**
   * 前缀词匹配
   * @param text - 输入文字
   * @returns 匹配结果或 null
   */
  private matchPrefix(
    text: string,
  ): { intent: UserIntent; content: string } | null {
    const trimmedText = text.trim();

    // 检查输入模式前缀
    for (const prefix of this.config.prefixes.input) {
      if (trimmedText.startsWith(prefix)) {
        return {
          intent: 'input',
          content: trimmedText.slice(prefix.length).trim(),
        };
      }
    }

    // 检查指令模式前缀
    for (const prefix of this.config.prefixes.command) {
      if (trimmedText.startsWith(prefix)) {
        return {
          intent: 'command',
          content: trimmedText.slice(prefix.length).trim(),
        };
      }
    }

    return null;
  }
}
