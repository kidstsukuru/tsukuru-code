import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/authStore';

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AdminHeader: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, isSuperAdmin } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // メニュー外クリック & Escapeキー処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        document.getElementById('admin-user-menu-button')?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
      <div className="px-8 py-4 flex justify-between items-center">
        {/* タイトルエリア */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            管理者パネル
          </h2>
          {isSuperAdmin && (
            <span className="text-xs text-amber-600 font-semibold">
              スーパー管理者
            </span>
          )}
        </div>

        {/* 右側エリア */}
        <div className="flex items-center space-x-4">
          {/* ユーザーメニュー */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                id="admin-user-menu-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                aria-label="ユーザーメニュー"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-200">
                  <UserIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role === 'super_admin' ? 'スーパー管理者' : '管理者'}</p>
                </div>
              </button>

              {/* ドロップダウンメニュー */}
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-20 ring-1 ring-black ring-opacity-5"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="admin-user-menu-button"
                >
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 transition-colors"
                    role="menuitem"
                  >
                    {t('common.logout')}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
