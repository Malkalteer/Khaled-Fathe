import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (normalizedName.length < 2) {
      setError('يرجى إدخال اسم مكوّن من حرفين على الأقل');
      return;
    }
    if (normalizedPhone.length < 5) {
      setError('يرجى إدخال رقم هاتف صحيح');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) {
      setError('كلمة المرور يجب أن تحتوي على 8 أحرف، حرف كبير، حرف صغير، ورقم');
      return;
    }

    fetch('https://khaled-fathe.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: normalizedName, email: normalizedEmail, password, phone: normalizedPhone })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        navigate('/login');
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
      <div className="w-full max-w-md bg-white dark:bg-dark-card shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-right">انشاء حساب</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 text-right">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-right"
            />
          </div>

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
            <label className="block text-sm text-gray-700 dark:text-gray-300 text-right">رقم الهاتف</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
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
            <p className="mt-1 text-xs text-gray-500 text-right">8 أحرف على الأقل، مع حرف كبير وحرف صغير ورقم</p>
          </div>

          <button className="w-full bg-primary-500 text-white py-2 rounded-md">انشاء حساب</button>
        </form>
        {error && <p className="text-sm mt-3 text-red-500 text-right">{error}</p>}
        <p className="text-sm mt-4 text-gray-600 dark:text-gray-300 text-right">
          لديك حساب؟ <Link to="/login" className="text-primary-600">سجل الدخول</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
