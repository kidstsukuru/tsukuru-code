import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useAuthStore } from '../../store/authStore';

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// DiceBear アバターURL生成
const getDiceBearUrl = (style: string, seed: string) => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=fef3c7,fed7aa,fecaca,d9f99d,a5f3fc,c4b5fd`;
};


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
    `px-4 py-3 min-h-[44px] rounded-md text-sm sm:text-base font-bold transition-colors flex items-center ${activeView === view
      ? 'text-amber-600 border-b-2 border-amber-500'
      : 'text-gray-500 hover:text-amber-600'
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center" role="navigation" aria-label="メインナビゲーション">
        <button
          onClick={handleLogoClick}
          className="text-xl sm:text-2xl font-extrabold text-amber-500 hover:text-amber-600 transition-colors text-center leading-tight focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
          aria-label={isAuthenticated ? 'ダッシュボードに戻る' : 'ホームページに戻る'}
        >
          Tsukuru
          <br />
          code
        </button>

        {isAuthenticated && (
          <div className="hidden sm:flex items-center space-x-2">
            <button onClick={() => navigate('/dashboard')} className={navLinkClasses('dashboard')}>
              {t('dashboard.title')}
            </button>
            <button onClick={() => navigate('/creations')} className={navLinkClasses('creations')}>
              {t('creations.title')}
            </button>
          </div>
        )}

        <div className="space-x-2 flex items-center">
          <LanguageSwitcher />
          {isAuthenticated && user ? (
            <>
              <div className="hidden sm:block font-bold text-sm text-right">
                {t('dashboard.welcome', { name: user.name })}
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  id="user-menu-button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 overflow-hidden"
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
                      <a href="#" className="block px-4 py-3 min-h-[44px] text-sm text-gray-700 hover:bg-amber-100 active:bg-amber-200 transition-colors flex items-center" role="menuitem">
                        {t('common.edit')}
                      </a>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); navigate('/subscription'); setIsMenuOpen(false); }}
                        className="block px-4 py-3 min-h-[44px] text-sm text-gray-700 hover:bg-amber-100 active:bg-amber-200 transition-colors flex items-center"
                        role="menuitem"
                      >
                        サブスクリプション
                      </a>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); logout(); setIsMenuOpen(false); }}
                        className="block px-4 py-3 min-h-[44px] text-sm text-gray-700 hover:bg-amber-100 active:bg-amber-200 transition-colors flex items-center"
                        role="menuitem"
                      >
                        {t('common.logout')}
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