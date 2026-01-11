/**
 * ロギングユーティリティ
 * 環境に応じてログ出力を制御します
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * 開発環境でのみログを出力
 */
const isDevelopment = import.meta.env.DEV;

/**
 * 本番環境でのログを制御するフラグ
 * 本番環境では機密情報を含むエラーメッセージをコンソールに出力しません
 */
const shouldLogInProduction = false;

/**
 * エラーログを出力（本番環境では抑制）
 * @param message - ログメッセージ
 * @param data - 追加データ（オプション）
 */
export const logError = (message: string, ...data: any[]): void => {
  if (isDevelopment || shouldLogInProduction) {
    console.error(`[Error] ${message}`, ...data);
  }

  // TODO: 本番環境ではエラー監視サービスに送信
  // if (import.meta.env.PROD) {
  //   sendToErrorTrackingService({ message, data, level: 'error' });
  // }
};

/**
 * 警告ログを出力
 * @param message - ログメッセージ
 * @param data - 追加データ（オプション）
 */
export const logWarn = (message: string, ...data: any[]): void => {
  if (isDevelopment) {
    console.warn(`[Warn] ${message}`, ...data);
  }
};

/**
 * 情報ログを出力（開発環境のみ）
 * @param message - ログメッセージ
 * @param data - 追加データ（オプション）
 */
export const logInfo = (message: string, ...data: any[]): void => {
  if (isDevelopment) {
    console.log(`[Info] ${message}`, ...data);
  }
};

/**
 * デバッグログを出力（開発環境のみ）
 * @param message - ログメッセージ
 * @param data - 追加データ（オプション）
 */
export const logDebug = (message: string, ...data: any[]): void => {
  if (isDevelopment) {
    console.debug(`[Debug] ${message}`, ...data);
  }
};

/**
 * ユーザーフレンドリーなエラーメッセージを生成
 * 本番環境では詳細なエラー情報を隠蔽します
 * @param error - エラーオブジェクト
 * @param defaultMessage - デフォルトのエラーメッセージ
 * @returns ユーザーに表示するエラーメッセージ
 */
export const getUserFriendlyErrorMessage = (
  error: any,
  defaultMessage: string = '予期しないエラーが発生しました'
): string => {
  // 開発環境では詳細なエラーメッセージを返す
  if (isDevelopment && error?.message) {
    return error.message;
  }

  // 本番環境では一般的なメッセージのみ返す
  return defaultMessage;
};

/**
 * エラー情報を安全にログに記録
 * 機密情報（パスワード、トークンなど）を含む可能性のあるデータをフィルタリング
 * @param error - エラーオブジェクト
 * @param context - コンテキスト情報
 */
export const logSecureError = (error: any, context?: Record<string, any>): void => {
  const sanitizedContext = context ? sanitizeLogData(context) : {};

  logError('An error occurred', {
    message: error?.message || 'Unknown error',
    ...sanitizedContext,
  });
};

/**
 * ログデータから機密情報を除外
 * @param data - ログデータ
 * @returns サニタイズされたデータ
 */
const sanitizeLogData = (data: Record<string, any>): Record<string, any> => {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'auth',
    'authorization',
    'cookie',
    'session',
  ];

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sensitive => keyLower.includes(sensitive));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
