/**
 * 匿名訪問者ID管理ユーティリティ
 * ログインしていないユーザーを識別するためのIDを生成・管理
 */

const VISITOR_ID_KEY = 'tsukuru_visitor_id';

/**
 * ユニークな訪問者IDを生成
 */
const generateVisitorId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `visitor_${timestamp}_${randomPart}`;
};

/**
 * 訪問者IDを取得（存在しない場合は新規生成）
 */
export const getVisitorId = (): string => {
    if (typeof window === 'undefined') {
        return generateVisitorId();
    }

    let visitorId = localStorage.getItem(VISITOR_ID_KEY);

    if (!visitorId) {
        visitorId = generateVisitorId();
        localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    return visitorId;
};

/**
 * ローカルストレージにいいね状態を保存
 */
const LIKED_CREATIONS_KEY = 'tsukuru_liked_creations';

export const getLocalLikedCreations = (): Set<string> => {
    if (typeof window === 'undefined') {
        return new Set();
    }

    try {
        const stored = localStorage.getItem(LIKED_CREATIONS_KEY);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch {
        // パースエラーの場合は空のセットを返す
    }
    return new Set();
};

export const addLocalLike = (creationId: string): void => {
    if (typeof window === 'undefined') return;

    const liked = getLocalLikedCreations();
    liked.add(creationId);
    localStorage.setItem(LIKED_CREATIONS_KEY, JSON.stringify([...liked]));
};

export const removeLocalLike = (creationId: string): void => {
    if (typeof window === 'undefined') return;

    const liked = getLocalLikedCreations();
    liked.delete(creationId);
    localStorage.setItem(LIKED_CREATIONS_KEY, JSON.stringify([...liked]));
};

export const isLocallyLiked = (creationId: string): boolean => {
    return getLocalLikedCreations().has(creationId);
};
