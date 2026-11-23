import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Mail, MessageCircle, Phone, Search, Trash2 } from 'lucide-react';
import { api, QuoteRequest, QuoteStatus } from '../../services/api';
import { useConfirm } from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import { useAdmin } from './AdminDashboard';
import { EmptyState, ListSkeleton, PageHeader, formatDate, timeAgo } from './ui';

const STATUS: Record<QuoteStatus, { label: string; className: string }> = {
  new: { label: 'جديد', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  in_progress: { label: 'قيد المتابعة', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  done: { label: 'تم', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  rejected: { label: 'مرفوض', className: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

export const QuoteStatusBadge: React.FC<{ status: QuoteStatus }> = ({ status }) => (
  <span className={`badge ${STATUS[status]?.className || ''}`}>{STATUS[status]?.label || status}</span>
);

const formatSize = (bytes = 0) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

const QuoteCard: React.FC<{
  quote: QuoteRequest;
  onUpdate: (q: QuoteRequest, data: { status: QuoteStatus; adminNote?: string }) => Promise<void>;
  onDelete: (q: QuoteRequest) => void;
}> = ({ quote, onUpdate, onDelete }) => {
  const [note, setNote] = useState(quote.adminNote || '');
  const waNumber = quote.phone.replace(/\D/g, '');
  const waText = `مرحباً ${quote.name}، معك فريق المهندس خالد بخصوص طلب عرض السعر الذي أرسلته${quote.product ? ` لـ "${quote.product.title}"` : ''}.`;

  return (
    <article className={`card p-5 ${quote.status === 'new' ? 'border-r-4 border-r-red-400' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold">{quote.name}</h3>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <div className="mt-1 text-xs text-gray-500" title={formatDate(quote.createdAt)}>{timeAgo(quote.createdAt)}</div>
        </div>
        <select
          value={quote.status}
          onChange={(e) => onUpdate(quote, { status: e.target.value as QuoteStatus })}
          className="field !w-auto !py-1.5"
          aria-label="حالة الطلب"
        >
          {(Object.keys(STATUS) as QuoteStatus[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer" className="btn !py-1.5 bg-green-600 text-white hover:bg-green-700">
          <MessageCircle size={14} /> واتساب
        </a>
        <a href={`tel:${quote.phone}`} className="btn-secondary !py-1.5" dir="ltr"><Phone size={14} /> {quote.phone}</a>
        {quote.email && <a href={`mailto:${quote.email}`} className="btn-secondary !py-1.5" dir="ltr"><Mail size={14} /> {quote.email}</a>}
      </div>

      {quote.product && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 p-2 text-sm dark:bg-gray-800">
          {quote.product.images?.[0] && <img src={quote.product.images[0]} alt="" className="h-9 w-9 rounded object-cover" />}
          <span className="text-gray-500">بخصوص:</span>
          <a href={`/project/${quote.product._id}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 hover:underline">{quote.product.title}</a>
        </div>
      )}

      {quote.message && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">{quote.message}</p>}

      {quote.file?.url && (
        <a href={quote.file.url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-primary-400 dark:border-gray-700">
          <FileText className="h-8 w-8 text-primary-600" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold" dir="ltr">{quote.file.name}</div>
            <div className="text-xs text-gray-500">{formatSize(quote.file.size)}</div>
          </div>
          <Download size={18} className="text-gray-400" />
        </a>
      )}

      <div className="mt-4 flex items-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
        <div className="flex-1">
          <label className="text-xs text-gray-500" htmlFor={`note-${quote._id}`}>ملاحظة داخلية</label>
          <input
            id={`note-${quote._id}`}
            className="field !py-1.5"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => note !== (quote.adminNote || '') && onUpdate(quote, { status: quote.status, adminNote: note })}
            placeholder="مثال: أُرسل عرض بـ 150$"
            maxLength={1000}
          />
        </div>
        <button onClick={() => onDelete(quote)} className="btn-icon hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40" aria-label="حذف الطلب"><Trash2 size={16} /></button>
      </div>
    </article>
  );
};

const QuotesPanel: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const toast = useToast();
  const confirm = useConfirm();
  const { refreshStats } = useAdmin();

  useEffect(() => {
    api.admin.quotes().then(setQuotes).catch((e) => toast.error(e)).finally(() => setLoading(false));
  }, [toast]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: quotes.length };
    quotes.forEach((q) => (c[q.status] = (c[q.status] || 0) + 1));
    return c;
  }, [quotes]);

  const shown = quotes.filter((q) => {
    const s = query.trim().toLowerCase();
    return (filter === 'all' || q.status === filter) &&
      (!s || q.name.toLowerCase().includes(s) || q.phone.includes(s) || (q.message || '').toLowerCase().includes(s));
  });

  const update = async (quote: QuoteRequest, data: { status: QuoteStatus; adminNote?: string }) => {
    try {
      const { quote: updated } = await api.admin.updateQuote(quote._id, data);
      setQuotes((list) => list.map((q) => (q._id === quote._id ? updated : q)));
      toast.success(data.adminNote !== undefined ? 'تم حفظ الملاحظة' : `الحالة: ${STATUS[data.status].label}`);
      refreshStats();
    } catch (error) {
      toast.error(error);
    }
  };

  const remove = async (quote: QuoteRequest) => {
    if (!(await confirm({ title: 'حذف الطلب؟', message: `طلب ${quote.name} سيُحذف نهائياً.`, confirmText: 'حذف', danger: true }))) return;
    try {
      await api.admin.deleteQuote(quote._id);
      setQuotes((list) => list.filter((q) => q._id !== quote._id));
      toast.success('تم حذف الطلب');
      refreshStats();
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div>
      <PageHeader title="طلبات عرض السعر" description="الطلبات وملفات التصميم (DXF / STL ...) التي يرسلها العملاء من صفحة «اطلب عرض سعر»." />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'new', 'in_progress', 'done', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${filter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'}`}
            >
              {s === 'all' ? 'الكل' : STATUS[s].label}
              <span className={`mr-2 rounded-full px-2 py-0.5 text-xs ${filter === s ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>{counts[s] || 0}</span>
            </button>
          ))}
        </div>
        <label className="relative md:mr-auto md:w-64">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input className="field pr-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث بالاسم أو الرقم..." aria-label="بحث" />
        </label>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <EmptyState icon={<FileText size={26} />} title="لا توجد طلبات" description="عندما يرسل عميل ملف تصميم من صفحة «اطلب عرض سعر» سيظهر هنا." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {shown.map((q) => <QuoteCard key={q._id} quote={q} onUpdate={update} onDelete={remove} />)}
        </div>
      )}
    </div>
  );
};

export default QuotesPanel;
