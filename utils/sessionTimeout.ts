/**
 * セッションタイムアウト管理ユーティリティ
 * ユーザーの非アクティブ時間を監視し、一定時間経過後に自動ログアウトします
 */

// タイムアウト時間（ミリ秒）
const TIMEOUT_DURATION = 30 * 60 * 1000; // 30分
const WARNING_DURATION = 5 * 60 * 1000;  // 警告表示: タイムアウトの5分前

// 最後のアクティビティタイムスタンプ
let lastActivityTime = Date.now();
let timeoutId: number | null = null;
let warningTimeoutId: number | null = null;

/**
 * アクティビティイベントのリスナー
 */
const activityEvents = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
];

/**
 * ユーザーアクティビティを記録
 */
const updateActivity = (): void => {
  lastActivityTime = Date.now();
};

/**
 * セッションタイムアウトを初期化
 * @param onTimeout - タイムアウト時のコールバック関数
 * @param onWarning - 警告表示時のコールバック関数（オプション）
 */
export const initSessionTimeout = (
  onTimeout: () => void,
  onWarning?: () => void
): void => {
  // アクティビティイベントリスナーを追加
  activityEvents.forEach(event => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  // タイムアウトチェックを開始
  const checkTimeout = (): void => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime;

    // タイムアウトチェック
    if (timeSinceLastActivity >= TIMEOUT_DURATION) {
      onTimeout();
      return;
    }

    // 警告チェック
    if (
      onWarning &&
      timeSinceLastActivity >= TIMEOUT_DURATION - WARNING_DURATION &&
      !warningTimeoutId
    ) {
      onWarning();
      warningTimeoutId = window.setTimeout(() => {
        warningTimeoutId = null;
      }, WARNING_DURATION);
    }

    // 次のチェックをスケジュール
    timeoutId = window.setTimeout(checkTimeout, 60000); // 1分ごとにチェック
  };

  // 初回チェック
  checkTimeout();
};

/**
 * セッションタイムアウトをクリーンアップ
 */
export const cleanupSessionTimeout = (): void => {
  // イベントリスナーを削除
  activityEvents.forEach(event => {
    window.removeEventListener(event, updateActivity);
  });

  // タイムアウトをクリア
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  if (warningTimeoutId) {
    clearTimeout(warningTimeoutId);
    warningTimeoutId = null;
  }
};

/**
 * セッションタイムアウトをリセット
 * ユーザーがログインした時などに呼び出します
 */
export const resetSessionTimeout = (): void => {
  lastActivityTime = Date.now();

  if (warningTimeoutId) {
    clearTimeout(warningTimeoutId);
    warningTimeoutId = null;
  }
};

/**
 * 現在の非アクティブ時間を取得（ミリ秒）
 * @returns 最後のアクティビティからの経過時間
 */
export const getInactiveTime = (): number => {
  return Date.now() - lastActivityTime;
};

/**
 * タイムアウトまでの残り時間を取得（ミリ秒）
 * @returns タイムアウトまでの残り時間
 */
export const getTimeUntilTimeout = (): number => {
  const inactive = getInactiveTime();
  return Math.max(0, TIMEOUT_DURATION - inactive);
};

/**
 * 残り時間を人間が読みやすい形式で取得
 * @returns フォーマットされた残り時間（例: "15分"）
 */
export const getFormattedTimeUntilTimeout = (): string => {
  const ms = getTimeUntilTimeout();
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}分`;
  }
  return `${seconds}秒`;
};
