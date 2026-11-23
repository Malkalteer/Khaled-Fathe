import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, FileUp, Loader2, X } from 'lucide-react';
import { api, Project } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SITE_URL } from '../lib/config';

const ACCEPT = '.dxf,.stl,.dwg,.svg,.pdf,.step,.stp,.obj,.ai,.eps,.png,.jpg,.jpeg';
const MAX_MB = 25;

const formatSize = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

const QuotePage: React.FC = () => {
  const [params] = useSearchParams();
  const productId = params.get('product') || '';
  const { user } = useAuth();
  const [product, setProduct] = useState<Project | null>(null);
  const [name, setName] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productId) api.getProject(productId).then(setProduct).catch(() => setProduct(null));
  }, [productId]);

  const pickFile = (f: File | undefined | null) => {
    setError('');
    if (!f) return;
    const ext = '.' + (f.name.split('.').pop() || '').toLowerCase();
    if (!ACCEPT.split(',').includes(ext)) return setError('نوع الملف غير مدعوم');
    if (f.size > MAX_MB * 1024 * 1024) return setError(`الحد الأقصى لحجم الملف ${MAX_MB} ميغابايت`);
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!file && !message.trim()) return setError('أرفق ملف التصميم أو اكتب وصفاً للمشروع');
    const form = new FormData();
    form.append('name', name.trim());
    form.append('phone', phone.trim());
    if (email.trim()) form.append('email', email.trim());
    if (message.trim()) form.append('message', message.trim());
    if (productId) form.append('product', productId);
    if (file) form.append('file', file);
    setSending(true);
    try {
      await api.sendQuote(form);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر إرسال الطلب');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center px-6" dir="rtl">
        <div className="card max-w-md w-full p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">تم استلام طلبك</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">سيراجع فريق المهندس خالد ملفك ويتواصل معك على الرقم {phone} قريباً.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/" className="btn-primary">العودة للرئيسية</Link>
            <button onClick={() => { setDone(false); setFile(null); setMessage(''); }} className="btn-secondary">طلب آخر</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4" dir="rtl">
      <Helmet>
        <title>اطلب عرض سعر | KHF Designs</title>
        <meta name="description" content="أرسل ملف التصميم (DXF / STL / DWG) واحصل على عرض سعر لتنفيذ مشروع CNC الخاص بك." />
        <link rel="canonical" href={`${SITE_URL}/quote`} />
      </Helmet>
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm text-gray-500 hover:text-primary-600">← العودة للرئيسية</Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">اطلب عرض سعر</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">أرفق ملف التصميم واكتب المقاسات والخامة المطلوبة، وسنرد عليك بعرض سعر دقيق.</p>

        <form onSubmit={submit} className="card mt-6 p-6 space-y-5">
          {product && (
            <div className="flex items-center gap-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 p-3">
              {product.images?.[0] && <img src={product.images[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />}
              <div className="text-sm">
                <div className="text-gray-500 dark:text-gray-400">بخصوص المنتج</div>
                <div className="font-bold text-gray-900 dark:text-white">{product.title}</div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="q-name">الاسم *</label>
              <input id="q-name" className="field" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} />
            </div>
            <div>
              <label className="field-label" htmlFor="q-phone">رقم الهاتف / واتساب *</label>
              <input id="q-phone" className="field" type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} required minLength={5} maxLength={30} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="q-email">البريد الإلكتروني (اختياري)</label>
            <input id="q-email" className="field" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="q-msg">تفاصيل المشروع</label>
            <textarea id="q-msg" className="field min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} placeholder="مثال: لوحة خشب MDF بسماكة 18 مم، مقاس 120×80 سم، الكمية 3 قطع" />
          </div>

          <div>
            <span className="field-label">ملف التصميم</span>
            {file ? (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <FileUp className="h-8 w-8 text-primary-600" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-semibold text-gray-900 dark:text-white" dir="ltr">{file.name}</div>
                  <div className="text-xs text-gray-500">{formatSize(file.size)}</div>
                </div>
                <button type="button" onClick={() => setFile(null)} className="btn-icon" aria-label="إزالة الملف"><X size={18} /></button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]); }}
                className={`w-full rounded-xl border-2 border-dashed p-8 text-center transition ${dragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-gray-300 dark:border-gray-700 hover:border-primary-400'}`}
              >
                <FileUp className="mx-auto h-10 w-10 text-gray-400" />
                <div className="mt-2 font-semibold text-gray-700 dark:text-gray-200">اسحب الملف هنا أو اضغط للاختيار</div>
                <div className="mt-1 text-xs text-gray-500" dir="ltr">DXF · STL · DWG · SVG · PDF · STEP · OBJ · AI — حتى {MAX_MB}MB</div>
              </button>
            )}
            <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
          </div>

          {error && <p className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}

          <button type="submit" disabled={sending} className="btn-primary w-full py-3 text-base">
            {sending ? <><Loader2 className="animate-spin" size={18} /> جاري الإرسال...</> : 'إرسال الطلب'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuotePage;
