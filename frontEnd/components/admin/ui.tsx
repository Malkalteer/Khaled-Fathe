import React, { useRef, useState } from 'react';
import { ImagePlus, Inbox, Loader2, Star } from 'lucide-react';

export const PageHeader: React.FC<{ title: string; description?: string; actions?: React.ReactNode }> = ({ title, description, actions }) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const EmptyState: React.FC<{ title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode }> = ({ title, description, action, icon }) => (
  <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
      {icon || <Inbox size={26} />}
    </div>
    <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${className}`} />
);

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="card divide-y divide-gray-100 dark:divide-gray-800">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        <Skeleton className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }> = ({ checked, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? '-translate-x-[22px]' : '-translate-x-0.5'}`} />
  </button>
);

export const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 14 }) => (
  <span className="inline-flex items-center gap-0.5 text-yellow-400" dir="ltr" aria-label={`${value} من 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'} />
    ))}
  </span>
);

export const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export const timeAgo = (value?: string) => {
  if (!value) return '';
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' });
  if (diff < 60) return 'الآن';
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute');
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour');
  if (diff < 86400 * 30) return rtf.format(-Math.floor(diff / 86400), 'day');
  return formatDate(value);
};

/** منطقة رفع صورة واحدة مع سحب وإفلات ومعاينة */
export const SingleImageUpload: React.FC<{
  value: string;
  onUpload: (file: File) => Promise<void>;
  label?: string;
}> = ({ value, onUpload, label = 'صورة' }) => {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const handle = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      await onUpload(file);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="field-label">{label}</span>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files?.[0]); }}
        className={`group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition ${
          drag ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-gray-300 hover:border-primary-400 dark:border-gray-700'
        }`}
      >
        {value ? (
          <>
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">تغيير الصورة</span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 text-gray-400">
            <ImagePlus size={28} />
            <span className="text-sm">اسحب صورة أو اضغط للاختيار</span>
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70">
            <Loader2 className="animate-spin text-primary-600" />
          </span>
        )}
      </button>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
};
