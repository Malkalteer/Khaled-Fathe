import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = (location.state as { from?: string } | null)?.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      navigate(from || (user.isAdmin ? '/admin' : '/'), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4" dir="rtl">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">KHF <span className="text-primary-500 text-sm">DESIGNS</span></Link>
        <h1 className="text-2xl font-bold mt-6 mb-1 text-gray-900 dark:text-white">تسجيل الدخول</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">أهلاً بعودتك 👋</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="login-email">البريد الإلكتروني</label>
            <input id="login-email" type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="login-password">كلمة المرور</label>
            <div className="relative">
              <input id="login-password" type={show ? 'text' : 'password'} dir="ltr" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="field pl-10" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
          <button className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? <><Loader2 className="animate-spin" size={18} /> جاري الدخول...</> : 'دخول'}
          </button>
        </form>
        <p className="text-sm mt-5 text-gray-600 dark:text-gray-300">
          ليس لديك حساب؟ <Link to="/register" className="text-primary-600 font-semibold">سجل الآن</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
