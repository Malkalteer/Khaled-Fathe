import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/Toast';
import GoogleSignIn from './GoogleSignIn';

const rules = [
  { test: (p: string) => p.length >= 8, label: '8 أحرف على الأقل' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'حرف كبير (A-Z)' },
  { test: (p: string) => /[a-z]/.test(p), label: 'حرف صغير (a-z)' },
  { test: (p: string) => /\d/.test(p), label: 'رقم (0-9)' },
];

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const username = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (username.length < 2) return setError('يرجى إدخال اسم مكوّن من حرفين على الأقل');
    if (phone.trim().length < 5) return setError('يرجى إدخال رقم هاتف صحيح');
    if (!rules.every((r) => r.test(password))) return setError('كلمة المرور لا تحقق الشروط');

    setLoading(true);
    try {
      await register({ username, email: normalizedEmail, password, phone: phone.trim() });
      await login(normalizedEmail, password);
      toast.success(`أهلاً ${username}! تم إنشاء حسابك`);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-10" dir="rtl">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">KHF <span className="text-primary-500 text-sm">DESIGNS</span></Link>
        <h1 className="text-2xl font-bold mt-6 mb-6 text-gray-900 dark:text-white">إنشاء حساب</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="reg-name">الاسم</label>
            <input id="reg-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="reg-email">البريد الإلكتروني</label>
            <input id="reg-email" type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="reg-phone">رقم الهاتف</label>
            <input id="reg-phone" type="tel" dir="ltr" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={30} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="reg-password">كلمة المرور</label>
            <input id="reg-password" type="password" dir="ltr" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="field" />
            <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">
              {rules.map((r) => {
                const ok = r.test(password);
                return (
                  <li key={r.label} className={`flex items-center gap-1 ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>
                    <Check size={12} className={ok ? '' : 'opacity-30'} /> {r.label}
                  </li>
                );
              })}
            </ul>
          </div>
          {error && <p className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
          <button className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? <><Loader2 className="animate-spin" size={18} /> جاري الإنشاء...</> : 'إنشاء حساب'}
          </button>
        </form>
        <GoogleSignIn />
        <p className="text-sm mt-5 text-gray-600 dark:text-gray-300">
          لديك حساب؟ <Link to="/login" className="text-primary-600 font-semibold">سجل الدخول</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
