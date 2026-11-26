import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ExternalLink, FileText, FolderTree, LayoutDashboard, LogOut, Menu, MessageSquareQuote, Moon, Package, Sun, Users, X,
} from 'lucide-react';
import { api, AdminStats } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Theme } from '../../types';
import Overview from './Overview';
import ProjectsPanel from './ProjectsPanel';
import CategoriesPanel from './CategoriesPanel';
import ReviewsPanel from './ReviewsPanel';
import QuotesPanel from './QuotesPanel';
import UsersPanel from './UsersPanel';

interface AdminCtx {
  stats: AdminStats | null;
  refreshStats: () => void;
}
const AdminContext = createContext<AdminCtx>({ stats: null, refreshStats: () => undefined });
export const useAdmin = () => useContext(AdminContext);

const NAV = [
  { to: '/admin', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'الأعمال', icon: Package, count: (s: AdminStats) => s.projects },
  { to: '/admin/categories', label: 'الفئات', icon: FolderTree, count: (s: AdminStats) => s.categories },
  { to: '/admin/quotes', label: 'رسائل العملاء', icon: FileText, alert: (s: AdminStats) => s.newQuotes },
  { to: '/admin/reviews', label: 'التقييمات', icon: MessageSquareQuote, alert: (s: AdminStats) => s.pendingReviews },
  { to: '/admin/users', label: 'المستخدمون', icon: Users, count: (s: AdminStats) => s.users },
];

interface Props {
  theme: Theme;
  toggleTheme: () => void;
}

const AdminDashboard: React.FC<Props> = ({ theme, toggleTheme }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const refreshStats = useCallback(() => {
    api.admin.stats().then(setStats).catch(() => undefined);
  }, []);

  useEffect(refreshStats, [refreshStats]);
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const sidebar = (
    <nav className="flex h-full flex-col" aria-label="قائمة لوحة التحكم">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
          KHF <span className="text-sm text-primary-500">ADMIN</span>
        </Link>
        <button className="btn-icon lg:hidden" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة">
          <X size={20} />
        </button>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const alert = stats && item.alert ? item.alert(stats) : 0;
          const count = stats && item.count ? item.count(stats) : null;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} />
                    <span className="flex-1">{item.label}</span>
                    {alert ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">{alert}</span>
                    ) : count !== null ? (
                      <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>{count}</span>
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
            {user?.username?.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</div>
            <div className="truncate text-xs text-gray-500" dir="ltr">{user?.email}</div>
          </div>
          <button onClick={() => logout()} className="btn-icon" title="تسجيل الخروج" aria-label="تسجيل الخروج">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <AdminContext.Provider value={{ stats, refreshStats }}>
      <Helmet>
        <title>لوحة التحكم | KHF Designs</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100" dir="rtl">
        {/* الشريط الجانبي (سطح المكتب) */}
        <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:block">
          {sidebar}
        </aside>

        {/* الشريط الجانبي (الجوال) */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
            <aside className="absolute inset-y-0 right-0 w-72 bg-white shadow-2xl animate-fade-in dark:bg-gray-900">{sidebar}</aside>
          </div>
        )}

        <div className="lg:pr-64">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 sm:px-6">
            <button className="btn-icon lg:hidden" onClick={() => setMenuOpen(true)} aria-label="فتح القائمة">
              <Menu size={20} />
            </button>
            <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
              مرحباً، <span className="font-semibold text-gray-900 dark:text-white">{user?.username}</span>
            </div>
            <button onClick={toggleTheme} className="btn-icon" aria-label="تبديل الوضع الليلي">
              {theme === Theme.DARK ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn-secondary !py-1.5">
              <ExternalLink size={16} /> <span className="hidden sm:inline">عرض الموقع</span>
            </a>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="projects" element={<ProjectsPanel />} />
              <Route path="categories" element={<CategoriesPanel />} />
              <Route path="quotes" element={<QuotesPanel />} />
              <Route path="reviews" element={<ReviewsPanel />} />
              <Route path="users" element={<UsersPanel />} />
              <Route path="*" element={<Overview />} />
            </Routes>
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
};

export default AdminDashboard;
