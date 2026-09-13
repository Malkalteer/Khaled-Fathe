import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    fetch('https://khaled-fathe.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        navigate('/');
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
      <div className="w-full max-w-md bg-white dark:bg-dark-card shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-right">تسجيل الدخول</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 text-right">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-right"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 text-right">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-right"
            />
          </div>

          <button className="w-full bg-primary-500 text-white py-2 rounded-md">دخول</button>
        </form>
        {error && <p className="text-sm mt-3 text-red-500 text-right">{error}</p>}
        <p className="text-sm mt-4 text-gray-600 dark:text-gray-300 text-right">
          ليس لديك حساب؟ <Link to="/register" className="text-primary-600">سجل الآن</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
