/**
 * ユーザーのprefers-reduced-motionの設定をチェック
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * アニメーション設定を最適化する
 * モバイルやprefers-reduced-motionが有効な場合は、簡素化したアニメーションを返す
 */
export const getOptimizedAnimation = <T extends Record<string, any>>(
  fullAnimation: T,
  reducedAnimation?: Partial<T>
): T => {
  const shouldReduce = prefersReducedMotion();

  if (shouldReduce && reducedAnimation) {
    return { ...fullAnimation, ...reducedAnimation } as T;
  }

  return fullAnimation;
};

/**
 * アニメーション遅延を計算（大量の要素がある場合に最適化）
 */
export const getStaggerDelay = (index: number, maxDelay: number = 0.5): number => {
  // 最初の20要素だけ遅延を適用、それ以降は遅延なし
  if (index > 20) return 0;
  return Math.min(index * 0.05, maxDelay);
};

/**
 * デバイスに応じたアニメーション設定を返す
 */
export const getDeviceOptimizedTransition = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return {
    type: isMobile ? 'tween' : 'spring',
    stiffness: isMobile ? undefined : 400,
    damping: isMobile ? undefined : 17,
    duration: isMobile ? 0.2 : undefined,
  };
};
