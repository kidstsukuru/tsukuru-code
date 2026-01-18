/**
 * 埋め込みコード（iframe）処理用のユーティリティ関数
 */

// 許可する埋め込みドメインのホワイトリスト
const ALLOWED_EMBED_DOMAINS = [
  'scratch.mit.edu',
  'turbowarp.org',        // Scratchの高速版
  'codepen.io',
  'replit.com',
  'youtube.com',
  'youtube-nocookie.com',
  'vimeo.com',
  'github.io',           // GitHub Pages
  'vercel.app',          // Vercel デプロイ
  'netlify.app',         // Netlify デプロイ
];

/**
 * iframeタグまたはURLから埋め込みURLを抽出する
 * @param input - iframeタグ文字列またはURL文字列
 * @returns 抽出されたURL、無効な場合はnull
 */
export function extractEmbedUrl(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmedInput = input.trim();

  // ケース1: iframeタグから src 属性を抽出
  const iframeMatch = trimmedInput.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch) {
    const extractedUrl = iframeMatch[1];
    return isAllowedEmbedUrl(extractedUrl) ? extractedUrl : null;
  }

  // ケース2: 直接URLが入力された場合
  if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
    // Scratch URLの場合、自動的に埋め込みURLに変換
    if (trimmedInput.includes('scratch.mit.edu/projects/')) {
      const embedUrl = convertToScratchEmbedUrl(trimmedInput);
      return isAllowedEmbedUrl(embedUrl) ? embedUrl : null;
    }

    // TurboWarp URLの場合も同様
    if (trimmedInput.includes('turbowarp.org/')) {
      const embedUrl = convertToTurboWarpEmbedUrl(trimmedInput);
      return isAllowedEmbedUrl(embedUrl) ? embedUrl : null;
    }

    // その他のURLはそのまま使用（ホワイトリストチェックあり）
    return isAllowedEmbedUrl(trimmedInput) ? trimmedInput : null;
  }

  return null;
}

/**
 * URLが許可されたドメインからのものか確認
 * @param url - チェックするURL
 * @returns 許可されている場合true
 */
export function isAllowedEmbedUrl(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);

    // httpsのみ許可（セキュリティ）
    if (urlObj.protocol !== 'https:') {
      return false;
    }

    // ホスト名がホワイトリストに含まれているか確認
    const hostname = urlObj.hostname.toLowerCase();
    return ALLOWED_EMBED_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch (error) {
    // URLパースエラー
    return false;
  }
}

/**
 * Scratch プロジェクトURLを埋め込みURLに変換
 * @param url - ScratchプロジェクトのURL
 * @returns 埋め込み用URL
 */
export function convertToScratchEmbedUrl(url: string): string {
  // 既に埋め込みURLの場合はそのまま返す
  if (url.includes('/embed')) {
    return url;
  }

  // プロジェクトIDを抽出
  const match = url.match(/scratch\.mit\.edu\/projects\/(\d+)/);
  if (match) {
    const projectId = match[1];
    return `https://scratch.mit.edu/projects/${projectId}/embed`;
  }

  return url;
}

/**
 * TurboWarp プロジェクトURLを埋め込みURLに変換
 * @param url - TurboWarpプロジェクトのURL
 * @returns 埋め込み用URL
 */
export function convertToTurboWarpEmbedUrl(url: string): string {
  // 既に埋め込みURLの場合はそのまま返す
  if (url.includes('/embed')) {
    return url;
  }

  // プロジェクトIDを抽出
  const match = url.match(/turbowarp\.org\/(\d+)/);
  if (match) {
    const projectId = match[1];
    return `https://turbowarp.org/${projectId}/embed`;
  }

  return url;
}

/**
 * 埋め込みコードの例を取得
 * @returns 埋め込みコードの例文
 */
export function getEmbedCodeExample(): string {
  return `<iframe src="https://scratch.mit.edu/projects/12345678/embed" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>`;
}

/**
 * 埋め込みURLが有効かどうかを検証し、エラーメッセージを返す
 * @param input - 検証する入力文字列
 * @returns エラーメッセージ、有効な場合はnull
 */
export function validateEmbedInput(input: string): string | null {
  if (!input || !input.trim()) {
    return '埋め込みコードまたはURLを入力してください';
  }

  const extractedUrl = extractEmbedUrl(input);

  if (!extractedUrl) {
    return '有効な埋め込みコードまたはURLを入力してください';
  }

  if (!isAllowedEmbedUrl(extractedUrl)) {
    return '許可されていないドメインです。Scratch、CodePen、Replit、YouTubeなどのURLを使用してください';
  }

  return null; // 検証成功
}

/**
 * ゲームURLの検証（直接URLとして入力される場合）
 * @param url - 検証するURL
 * @returns URLが有効な場合true
 */
export function isValidGameUrl(url: string): boolean {
  if (!url || !url.trim()) {
    return false;
  }

  try {
    const urlObj = new URL(url.trim());
    // HTTPSまたはHTTPを許可（開発環境でlocalhostを使用する場合もあるため）
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
}

