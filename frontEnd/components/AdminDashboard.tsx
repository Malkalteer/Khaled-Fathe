import React, { useEffect, useState } from 'react';
import { api, Category, Project } from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
}

interface Review {
  _id: string;
  username: string;
  text: string;
}

const AdminDashboard: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catEditId, setCatEditId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projImages, setProjImages] = useState<string[]>(['']);
  const [projCategory, setProjCategory] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projEditId, setProjEditId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'reviews' | 'content'>('users');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCategories(await api.getCategories());
      setProjects(await api.getProjects());
      // جلب المستخدمين من الباك اند
      const usersRes = await fetch('http://localhost:5000/api/auth/users');
      const usersData = await usersRes.json();
      setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
      // جلب التعليقات من الباك اند
      const reviewsRes = await fetch('http://localhost:5000/api/reviews');
      const reviewsData = await reviewsRes.json();
      setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.reviews || []);
      setLoading(false);
    };
    fetchData();
  }, []);
  // حذف مستخدم
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    await fetch(`http://localhost:5000/api/auth/users/${id}`, { method: 'DELETE' });
    setUsers(users => users.filter(u => u._id !== id));
  };

  // حذف تعليق
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
    await fetch(`http://localhost:5000/api/reviews/${id}`, { method: 'DELETE' });
    setReviews(reviews => reviews.filter(r => r._id !== id));
  };

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await api.uploadImage(file);
      setCatImage(url);
    } catch (error) {
      alert('فشل رفع الصورة');
    }
  };

  const handleProjImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await api.uploadImage(file);
      const newImgs = [...projImages];
      newImgs[idx] = url;
      setProjImages(newImgs);
    } catch (error) {
      alert('فشل رفع الصورة');
    }
  };


  const handleAddOrEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catImage) return;
    if (catEditId) {
      await api.updateCategory({ _id: catEditId, name: catName, image: catImage });
    } else {
      await api.addCategory({ name: catName, image: catImage });
    }
    setCategories(await api.getCategories());
    setCatName('');
    setCatImage('');
    setCatEditId(null);
  };

  const handleEditCategory = (cat: Category) => {
    setCatEditId(cat._id);
    setCatName(cat.name);
    setCatImage(cat.image);
  };

  const handleDeleteCategory = async (id: string) => {
    await api.deleteCategory(id);
    setCategories(await api.getCategories());
    setProjects(await api.getProjects());
  };

  const handleAddOrEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredImages = projImages.filter(img => img.trim() !== '');
    if (!projTitle || filteredImages.length === 0 || !projCategory) return;
    if (projEditId) {
      await api.updateProject({ _id: projEditId, title: projTitle, images: filteredImages, category: projCategory, description: projDescription });
    } else {
      await api.addProject({ title: projTitle, images: filteredImages, category: projCategory, description: projDescription });
    }
    setProjects(await api.getProjects());
    setProjTitle('');
    setProjImages(['']);
    setProjCategory('');
    setProjDescription('');
    setProjEditId(null);
  };

  const handleEditProject = (proj: Project) => {
    setProjEditId(proj._id);
    setProjTitle(proj.title);
    if (Array.isArray(proj.images) && proj.images.length > 0) {
      setProjImages(proj.images);
    } else {
      setProjImages(['']);
    }
    setProjCategory(typeof proj.category === 'string' ? proj.category : (proj.category as Category)._id);
    setProjDescription(proj.description);
  };

  const handleDeleteProject = async (id: string) => {
    await api.deleteProject(id);
    setProjects(await api.getProjects());
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-950 text-white min-h-screen rounded-lg mt-8 shadow-2xl">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary-400 drop-shadow-md">لوحة تحكم الإدارة</h2>

      {/* شريط التبويبات */}
      <div className="flex flex-wrap justify-center gap-4 mb-10 pb-4 border-b border-gray-800">
        <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${activeTab === 'users' ? 'bg-primary-600 text-white shadow-lg scale-105 ring-2 ring-primary-300' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>المستخدمون</button>
        <button onClick={() => setActiveTab('reviews')} className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${activeTab === 'reviews' ? 'bg-primary-600 text-white shadow-lg scale-105 ring-2 ring-primary-300' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>التعليقات</button>
        <button onClick={() => setActiveTab('content')} className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${activeTab === 'content' ? 'bg-primary-600 text-white shadow-lg scale-105 ring-2 ring-primary-300' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>الكاتيجوري والكاردات</button>
      </div>

      {/* إدارة المستخدمين */}
      {activeTab === 'users' && (
      <div className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800 animate-fadeIn">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2"><span className="text-primary-500">❖</span> المستخدمون المسجلون</h3>
        <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-300 text-sm uppercase tracking-wider">
              <th className="p-4 rounded-tr-lg">الاسم</th>
              <th className="p-4">البريد الإلكتروني</th>
              <th className="p-4">رقم الهاتف</th>
              <th className="p-4 rounded-tl-lg">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.phone || '-'}</td>
                <td className="p-4 border-b border-gray-800">
                  <button onClick={() => handleDeleteUser(user._id)} className="bg-red-600 hover:bg-red-500 transition-colors text-white rounded-md px-3 py-1 text-sm shadow-md">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      )}

      {/* إدارة التعليقات */}
      {activeTab === 'reviews' && (
      <div className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800 animate-fadeIn">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2"><span className="text-primary-500">❖</span> آراء العملاء</h3>
        <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-300 text-sm uppercase tracking-wider">
              <th className="p-4 rounded-tr-lg">المستخدم</th>
              <th className="p-4">التعليق</th>
              <th className="p-4 rounded-tl-lg">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review._id}>
                <td className="border p-2">{review.username}</td>
                <td className="border p-2">{review.text}</td>
                <td className="p-4 border-b border-gray-800">
                  <button onClick={() => handleDeleteReview(review._id)} className="bg-red-600 hover:bg-red-500 transition-colors text-white rounded-md px-3 py-1 text-sm shadow-md">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      )}

      {/* إدارة الكاتيجوري والكاردات */}
      {activeTab === 'content' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fadeIn">
        {/* إدارة الكاتيجوري */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800">
          <h3 className="text-2xl font-semibold mb-6 text-primary-300">{catEditId ? 'تعديل الفئة (كاتيجوري)' : 'إضافة فئة جديدة'}</h3>
          <form onSubmit={handleAddOrEditCategory} className="mb-4 flex flex-col gap-2">
            <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="اسم الكاتيجوري" className="border p-2 rounded text-black" />
            <div className="flex gap-2 items-center">
              <input type="file" accept="image/*" onChange={handleCatImageUpload} className="border p-2 rounded text-black flex-1" />
              {catImage && <img src={catImage} alt="Preview" className="w-10 h-10 object-cover rounded" />}
            </div>
            <div className="flex gap-4 mt-2">
              <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-500 transition-colors text-white rounded-lg py-2 font-bold shadow-lg">{catEditId ? 'حفظ التعديلات' : 'إضافة الفئة'}</button>
              {catEditId && <button type="button" onClick={() => { setCatEditId(null); setCatName(''); setCatImage(''); }} className="bg-gray-600 hover:bg-gray-500 transition-colors text-white rounded-lg px-4 font-bold shadow-lg">إلغاء</button>}
            </div>
          </form>
          
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-400 mb-4 border-b border-gray-800 pb-2">الفئات الحالية</h4>
            <ul className="space-y-3">
              {categories.filter(c => c._id !== 'all').map(cat => (
                <li key={cat._id} className="flex items-center gap-4 bg-gray-800 p-3 rounded-lg shadow border border-gray-700">
                  <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-lg object-cover shadow-sm bg-gray-700" />
                  <span className="flex-1 text-lg font-medium">{cat.name}</span>
                  <button onClick={() => handleEditCategory(cat)} className="text-sm bg-emerald-600 hover:bg-emerald-500 transition-colors text-white rounded-md px-3 py-1.5 shadow">تعديل</button>
                  <button onClick={() => handleDeleteCategory(cat._id)} className="text-sm bg-red-600 hover:bg-red-500 transition-colors text-white rounded-md px-3 py-1.5 shadow">حذف</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* إدارة الكاردات */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800">
          <h3 className="text-2xl font-semibold mb-6 text-primary-300">{projEditId ? 'تعديل عمل (كارد)' : 'إضافة عمل جديد'}</h3>
          <form onSubmit={handleAddOrEditProject} className="mb-4 flex flex-col gap-2">
            <input value={projTitle} onChange={e => setProjTitle(e.target.value)} placeholder="عنوان الكارد" className="border p-2 rounded text-black" />
            {/* حقول الصور */}
            <div className="flex flex-col gap-2">
              {projImages.map((img, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-1 flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleProjImageUpload(e, idx)}
                      className="border p-2 rounded text-black flex-1"
                    />
                    {img && <img src={img} alt="Preview" className="w-10 h-10 object-cover rounded" />}
                  </div>
                  {projImages.length > 1 && (
                    <button type="button" className="bg-red-400 text-white rounded p-2" onClick={() => setProjImages(projImages.filter((_, i) => i !== idx))}>حذف</button>
                  )}
                </div>
              ))}
              <button type="button" className="bg-blue-400 text-white rounded p-2 w-fit" onClick={() => setProjImages([...projImages, ''])}>إضافة صورة أخرى</button>
            </div>
            <select value={projCategory} onChange={e => setProjCategory(e.target.value)} className="border p-2 rounded w-3/4 text-black">
              <option disabled hidden value="">اختر كاتيجوري</option>
              {categories.filter(c => c._id !== 'all').map(cat => (
                <option className='text-black bg-white' key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <textarea value={projDescription} onChange={e => setProjDescription(e.target.value)} placeholder="وصف إضافي" className="border p-2 rounded text-black" />
            <div className="flex gap-4 mt-2">
              <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-500 transition-colors text-white rounded-lg py-2 font-bold shadow-lg">{projEditId ? 'حفظ التعديلات' : 'إضافة العمل'}</button>
              {projEditId && <button type="button" onClick={() => { setProjEditId(null); setProjTitle(''); setProjImages(['']); setProjCategory(''); setProjDescription(''); }} className="bg-gray-600 hover:bg-gray-500 transition-colors text-white rounded-lg px-4 font-bold shadow-lg">إلغاء</button>}
            </div>
          </form>

          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-400 mb-4 border-b border-gray-800 pb-2">الأعمال الحالية</h4>
            <ul className="space-y-3">
              {projects.map(proj => (
                <li key={proj._id} className="flex items-center gap-4 bg-gray-800 p-3 rounded-lg shadow border border-gray-700">
                  <img src={proj.images && proj.images.length > 0 ? proj.images[0] : 'https://via.placeholder.com/80x80?text=No+Image'} alt={proj.title} className="w-12 h-12 rounded-lg object-cover shadow-sm bg-gray-700" />
                  <span className="flex-1 font-medium">{proj.title}</span>
                  <button onClick={() => handleEditProject(proj)} className="text-sm bg-emerald-600 hover:bg-emerald-500 transition-colors text-white rounded-md px-3 py-1.5 shadow">تعديل</button>
                  <button onClick={() => handleDeleteProject(proj._id)} className="text-sm bg-red-600 hover:bg-red-500 transition-colors text-white rounded-md px-3 py-1.5 shadow">حذف</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default AdminDashboard;
