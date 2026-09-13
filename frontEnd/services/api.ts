// services/api.ts
// API service for categories and projects (real API)

export interface Category {
  _id: string;
  name: string;
  image: string;
}

export interface Project {
  _id: string;
  title: string;
  category: string | Category; // category id or populated
  images: string[];
  description: string;
}

const API_URL = 'https://khaled-fathe.onrender.com';

const normalizeImageUrl = (url: string): string => {
  if (!url) return url;
  if (url.startsWith('/uploads/')) return `${API_URL}${url}`;
  if (url.startsWith('/api/upload/')) return `${API_URL}${url}`;
  return url;
};

export const api = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'فشل رفع الصورة');
    if (!data.url) throw new Error('لم يُرجع الخادم رابط الصورة');
    return data.url;
  },
  getCategories: async (): Promise<Category[]> => {
    const res = await fetch(`${API_URL}/api/categories`);
    const data = await res.json();
    // إضافة الكل
    const categories = data.map((category: Category) => ({
      ...category,
      image: normalizeImageUrl(category.image),
    }));
    return [{ _id: 'all', name: 'الكل', image: 'https://static.vecteezy.com/system/resources/thumbnails/006/201/197/small_2x/cnc-computer-numerical-control-icon-vector.jpg' }, ...categories];
  },
  getProjects: async (): Promise<Project[]> => {
    const res = await fetch(`${API_URL}/api/projects`);
    const data = await res.json();
    return data.map((project: Project) => ({
      ...project,
      images: project.images.map(normalizeImageUrl),
    }));
  },
  addCategory: async (cat: Omit<Category, '_id'>): Promise<Category> => {
    const res = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    return await res.json();
  },
  addProject: async (proj: Omit<Project, '_id'>): Promise<Project> => {
    const res = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...proj,
        images: proj.images,
        category: typeof proj.category === 'string' ? proj.category : (proj.category as Category)._id,
      }),
    });
    return await res.json();
  },
  deleteCategory: async (id: string) => {
    await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE', credentials: 'include' });
  },
  deleteProject: async (id: string) => {
    await fetch(`${API_URL}/api/projects/${id}`, { method: 'DELETE', credentials: 'include' });
  },
  updateCategory: async (cat: Category) => {
    await fetch(`${API_URL}/api/categories/${cat._id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cat.name, image: cat.image }),
    });
  },
  updateProject: async (proj: Project) => {
    await fetch(`${API_URL}/api/projects/${proj._id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: proj.title,
        images: proj.images,
        category: typeof proj.category === 'string' ? proj.category : (proj.category as Category)._id,
        description: proj.description,
      }),
    });
  },
};
