import React from 'react';

/**
 * SkipLink component provides keyboard users a way to skip to main content
 * This improves accessibility by allowing users to bypass repetitive navigation
 */
const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300"
    >
      メインコンテンツへスキップ
    </a>
  );
};

export default SkipLink;
