/**
 * 用户意图类型
 */
export type UserIntent = 'input' | 'command';

/**
 * 意图分析结果
 */
export interface IntentResult {
  /** 用户意图 */
  intent: UserIntent;
  /** 纯净内容（去除前缀词后） */
  content: string;
  /** 置信度 0~1 */
  confidence: number;
  /** 判断方式 */
  method: 'prefix' | 'llm';
}

/**
 * 意图分析配置
 */
export interface IntentAnalyzerConfig {
  /** 前缀词映射 */
  prefixes: {
    /** 输入模式前缀，如 ['输入'] */
    input: string[];
    /** 指令模式前缀，如 ['指令'] */
    command: string[];
  };
}
