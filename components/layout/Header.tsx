import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import { UserIcon } from '../icons';
import { useAuthStore } from '../../store/authStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { getDiceBearUrl } from '../../utils/avatarHelpers';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 現在のパスからactiveViewを判定
  const getActiveView = (): 'dashboard' | 'course' | 'creations' | null => {
    if (location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname.startsWith('/course/')) return 'course';
    if (location.pathname === '/creations') return 'creations';
    return null;
  };

  const activeView = getActiveView();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        // Return focus to the menu button
        document.getElementById('user-menu-button')?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  const navLinkClasses = (view: 'dashboard' | 'course' | 'creations') =>
    `px-4 py-3 landscape:px-2 landscape:py-1 min-h-[44px] landscape:min-h-0 rounded-md text-sm sm:text-base landscape:text-sm font-bold transition-colors flex items-center ${activeView === view
      ? 'text-amber-600 border-b-2 border-amber-500'
      : 'text-gray-500 hover:text-amber-600'
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 py-3 landscape:py-1 flex justify-between items-center" role="navigation" aria-label="メインナビゲーション">
        <div className="flex items-center gap-2">
          {/* サイドバートグルボタン（モバイル・ログイン時のみ） */}
          {isAuthenticated && (
            <button
              onClick={() => useSidebarStore.getState().toggleSidebar()}
              className="lg:hidden p-2 landscape:p-1 min-w-[40px] min-h-[40px] landscape:min-w-[32px] landscape:min-h-[32px] flex items-center justify-center text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
              aria-label="メニューを開く"
            >
              <svg className="w-6 h-6 landscape:w-5 landscape:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <button
            onClick={handleLogoClick}
            className="text-xl sm:text-2xl landscape:text-lg font-extrabold text-amber-500 hover:text-amber-600 transition-colors text-center leading-tight focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
            aria-label={isAuthenticated ? 'ダッシュボードに戻る' : 'ホームページに戻る'}
          >
            <span className="landscape:hidden">Tsukuru<br />code</span>
            <span className="hidden landscape:inline">Tsukuru code</span>
          </button>
        </div>

        <div className="space-x-2 flex items-center">
          {isAuthenticated && user ? (
            <>
              <div className="hidden sm:block font-bold text-sm text-right">
                {t('dashboard.welcome', { name: user.name })}
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  id="user-menu-button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 landscape:w-8 landscape:h-8 landscape:min-w-[32px] landscape:min-h-[32px] rounded-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 overflow-hidden"
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                  aria-label="ユーザーメニュー"
                >
                  <img
                    src={getDiceBearUrl(user.avatarStyle || 'adventurer', user.avatarSeed || user.name)}
                    alt="アバター"
                    className="w-full h-full"
                  />
                </button>
                {isMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1 z-20 ring-1 ring-black ring-opacity-5"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="sm:hidden px-4 py-3 border-b">
                      <p className="text-sm font-bold">{t('dashboard.welcome', { name: user.name })}</p>
                    </div>
                    <div className="sm:hidden py-1">
                      <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); setIsMenuOpen(false); }} className="block px-4 py-3 min-h-[44px] text-sm text-gray-700 hover:bg-amber-100 active:bg-amber-200 transition-colors flex items-center">{t('dashboard.title')}</a>
                      <a href="#" onClick={(e) => { e.preventDefault(); navigate('/creations'); setIsMenuOpen(false); }} className="block px-4 py-3 min-h-[44px] text-sm text-gray-700 hover:bg-amber-100 active:bg-amber-200 transition-colors flex items-center">{t('creations.title')}</a>
                    </div>
                    <div className="py-1 border-t sm:border-none">
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); navigate('/settings'); setIsMenuOpen(false); }}
                        className="block px-4 py-3 min-h-[44px] text-sm text-gray-700 hover:bg-amber-100 active:bg-amber-200 transition-colors flex items-center gap-2"
                        role="menuitem"
                      >
                        <span>⚙️</span> 設定
                      </a>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); navigate('/subscription'); setIsMenuOpen(false); }}
                        className="block px-4 py-3 min-h-[44px] text-sm text-gray-700 hover:bg-amber-100 active:bg-amber-200 transition-colors flex items-center gap-2"
                        role="menuitem"
                      >
                        <span>💎</span> サブスクリプション
                      </a>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); logout(); setIsMenuOpen(false); }}
                        className="block px-4 py-3 min-h-[44px] text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors flex items-center gap-2"
                        role="menuitem"
                      >
                        <span>🚪</span> {t('common.logout')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/login')}>{t('common.login')}</Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;