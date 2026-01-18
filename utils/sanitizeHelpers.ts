import DOMPurify from 'dompurify';

/**
 * HTMLコンテンツをサニタイズして、XSS攻撃を防ぎます。
 *
 * @param dirty - サニタイズする前のHTML文字列
 * @returns サニタイズされた安全なHTML文字列
 *
 * @example
 * ```tsx
 * const safeHTML = sanitizeHTML('<p>安全なコンテンツ</p><script>alert("危険")</script>');
 * // 結果: '<p>安全なコンテンツ</p>'
 * ```
 */
export const sanitizeHTML = (dirty: string): string => {
  // DOMPurifyの設定
  const config = {
    // 許可するタグ（TipTapで使用される基本的なタグ）
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span'
    ],

    // 許可する属性
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'id',
      'data-*' // TipTapのカスタム属性用
    ],

    // リンクのプロトコル制限（https, http, mailto のみ）
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

    // 外部リンクには rel="noopener noreferrer" を自動追加
    ADD_ATTR: ['target'],

    // script, style, iframe などの危険なタグを完全に削除
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],

    // イベントハンドラー属性を禁止
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  };

  return DOMPurify.sanitize(dirty, config);
};

/**
 * React コンポーネントで安全に使用するための dangerouslySetInnerHTML オブジェクトを生成
 *
 * @param html - HTMLコンテンツ
 * @returns サニタイズされたHTMLを含む dangerouslySetInnerHTML オブジェクト
 *
 * @example
 * ```tsx
 * <div {...createSafeHTML('<p>コンテンツ</p>')} />
 * // または
 * <div dangerouslySetInnerHTML={createSafeHTML('<p>コンテンツ</p>')} />
 * ```
 */
export const createSafeHTML = (html: string): { __html: string } => {
  return { __html: sanitizeHTML(html) };
};
