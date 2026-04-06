import type { UserIntent } from '../intent/types.js';

/**
 * 语音输入结果
 */
export interface VoiceInputResult {
  /** 识别/提交的文字 */
  text: string;
  /** 意图分析结果 */
  intent: UserIntent;
  /** 输入来源 */
  source: 'mic' | 'phone';
  /** 时间戳 */
  timestamp: number;
}

/**
 * 文字注入配置
 */
export interface TextInjectorConfig {
  /** 用户 UID，用于确定 XDG_RUNTIME_DIR */
  uid: number;
  /** wl-copy 路径，默认 'wl-copy' */
  wlCopyPath?: string;
  /** ydotool 路径，默认 'ydotool' */
  ydotoolPath?: string;
  /** wl-copy 和粘贴之间的间隔（ms），默认 50 */
  pasteDelayMs?: number;
  /** 模拟模式（用于测试），默认 false */
  mockMode?: boolean;
}

/**
 * 语音输入服务配置
 */
export interface VoiceInputServiceConfig {
  /** 意图分析器配置 */
  intentAnalyzerConfig: {
    /** 前缀词映射 */
    prefixes: {
      input: string[];
      command: string[];
    };
  };
  /** 文字注入配置 */
  textInjectorConfig: TextInjectorConfig;
  /** 结果回调 */
  onResult: (result: VoiceInputResult) => void;
}
