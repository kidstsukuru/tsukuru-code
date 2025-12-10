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
    `px-3 py-2 rounded-md text-sm sm:text-base font-bold transition-colors ${
        activeView === view
        ? 'text-amber-600 border-b-2 border-amber-500'
        : 'text-gray-500 hover:text-amber-600'
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-10">
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
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                            aria-expanded={isMenuOpen}
                            aria-haspopup="true"
                            aria-label="ユーザーメニュー"
                        >
                            <UserIcon className="w-6 h-6 text-gray-600" />
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
                                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-100 transition-colors">{t('dashboard.title')}</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/creations'); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-100 transition-colors">{t('creations.title')}</a>
                                </div>
                                <div className="py-1 border-t sm:border-none">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-100 transition-colors" role="menuitem">
                                        {t('common.edit')}
                                    </a>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); logout(); setIsMenuOpen(false); }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-100 transition-colors"
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