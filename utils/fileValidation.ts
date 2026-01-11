/**
 * ファイルバリデーションユーティリティ
 * ファイルアップロードのセキュリティとユーザビリティを向上させます
 */

// 許可される画像MIMEタイプ
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

// 許可される画像拡張子
export const ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
] as const;

// ファイルサイズ制限（バイト単位）
export const MAX_FILE_SIZE = {
  AVATAR: 5 * 1024 * 1024,      // 5MB
  THUMBNAIL: 10 * 1024 * 1024,  // 10MB
  GENERAL: 5 * 1024 * 1024,     // 5MB（デフォルト）
} as const;

/**
 * ファイルバリデーションのエラータイプ
 */
export type FileValidationError =
  | 'INVALID_TYPE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_EXTENSION'
  | 'NO_FILE';

/**
 * ファイルバリデーション結果
 */
export interface FileValidationResult {
  valid: boolean;
  error?: FileValidationError;
  message?: string;
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 * @param bytes - バイト数
 * @returns フォーマットされた文字列（例: "5 MB"）
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * 画像ファイルのMIMEタイプを検証
 * @param file - 検証するファイル
 * @returns バリデーション結果
 */
export const validateImageType = (file: File): FileValidationResult => {
  if (!file) {
    return {
      valid: false,
      error: 'NO_FILE',
      message: 'ファイルが選択されていません',
    };
  }

  // MIMEタイプの検証
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'INVALID_TYPE',
      message: `このファイル形式はサポートされていません。対応形式: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
    };
  }

  // ファイル拡張子の検証（二重チェック）
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_IMAGE_EXTENSIONS.includes(extension as any)) {
    return {
      valid: false,
      error: 'INVALID_EXTENSION',
      message: `無効なファイル拡張子です。対応拡張子: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * ファイルサイズを検証
 * @param file - 検証するファイル
 * @param maxSize - 最大ファイルサイズ（バイト）
 * @returns バリデーション結果
 */
export const validateFileSize = (file: File, maxSize: number): FileValidationResult => {
  if (!file) {
    return {
      valid: false,
      error: 'NO_FILE',
      message: 'ファイルが選択されていません',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'FILE_TOO_LARGE',
      message: `ファイルサイズが大きすぎます。最大: ${formatFileSize(maxSize)}（現在: ${formatFileSize(file.size)}）`,
    };
  }

  return { valid: true };
};

/**
 * 画像ファイルの完全なバリデーション（タイプ + サイズ）
 * @param file - 検証するファイル
 * @param maxSize - 最大ファイルサイズ（バイト）
 * @returns バリデーション結果
 */
export const validateImageFile = (
  file: File,
  maxSize: number = MAX_FILE_SIZE.GENERAL
): FileValidationResult => {
  // タイプの検証
  const typeValidation = validateImageType(file);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // サイズの検証
  const sizeValidation = validateFileSize(file, maxSize);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
};

/**
 * アバター画像のバリデーション
 * @param file - 検証するファイル
 * @returns バリデーション結果
 */
export const validateAvatarImage = (file: File): FileValidationResult => {
  return validateImageFile(file, MAX_FILE_SIZE.AVATAR);
};

/**
 * サムネイル画像のバリデーション
 * @param file - 検証するファイル
 * @returns バリデーション結果
 */
export const validateThumbnailImage = (file: File): FileValidationResult => {
  return validateImageFile(file, MAX_FILE_SIZE.THUMBNAIL);
};

/**
 * ファイル入力要素のaccept属性用の文字列を生成
 * @returns accept属性の値（例: "image/jpeg,image/png,image/gif"）
 */
export const getImageAcceptString = (): string => {
  return ALLOWED_IMAGE_TYPES.join(',');
};
