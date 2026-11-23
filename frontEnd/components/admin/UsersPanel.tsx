import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Search, ShieldCheck, Trash2, Users } from 'lucide-react';
import { api, AdminUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import { useAdmin } from './AdminDashboard';
import { EmptyState, ListSkeleton, PageHeader, formatDate } from './ui';

const UsersPanel: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const { user: me } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const { refreshStats } = useAdmin();

  useEffect(() => {
    api.admin.users().then(setUsers).catch((e) => toast.error(e)).finally(() => setLoading(false));
  }, [toast]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone || '').includes(q));
  }, [users, query]);

  const remove = async (u: AdminUser) => {
    const ok = await confirm({
      title: `حذف ${u.username}؟`,
      message: 'سيُحذف الحساب مع تقييماته ومفضلته نهائياً.',
      confirmText: 'حذف الحساب',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.admin.deleteUser(u._id);
      setUsers((list) => list.filter((x) => x._id !== u._id));
      toast.success('تم حذف المستخدم');
      refreshStats();
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div>
      <PageHeader title="المستخدمون" description={`${users.length} حساب مسجّل`} />

      <label className="relative mb-4 block md:w-80">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input className="field pr-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث بالاسم أو البريد أو الهاتف..." aria-label="بحث" />
      </label>

      {loading ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <EmptyState icon={<Users size={26} />} title="لا يوجد مستخدمون" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">المستخدم</th>
                  <th className="px-4 py-3 font-semibold">الهاتف</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">تاريخ التسجيل</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {shown.map((u) => {
                  const locked = u.lockoutUntil && new Date(u.lockoutUntil) > new Date();
                  const isMe = me?.id === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                            {u.username.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-semibold">
                              <span className="truncate">{u.username}</span>
                              {u.isAdmin && <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><ShieldCheck size={11} /> مدير</span>}
                              {locked && <span className="badge bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" title="مقفل مؤقتاً بسبب محاولات دخول فاشلة"><Lock size={11} /> مقفل</span>}
                            </div>
                            <div className="truncate text-xs text-gray-500" dir="ltr">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300" dir="ltr">
                        {u.phone && u.phone !== 'not-provided' ? <a href={`tel:${u.phone}`} className="hover:text-primary-600">{u.phone}</a> : '—'}
                      </td>
                      <td className="hidden px-4 py-3 text-gray-500 md:table-cell">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3 text-left">
                        <button
                          onClick={() => remove(u)}
                          disabled={u.isAdmin || isMe}
                          title={u.isAdmin ? 'لا يمكن حذف حساب مدير' : 'حذف'}
                          className="btn-icon hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40"
                          aria-label="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPanel;
