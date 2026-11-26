import { apiFetch } from './http';

export interface Category {
  _id: string;
  name: string;
  image: string;
  createdAt?: string;
}

export interface ProductStats {
  averageRating?: number;
  votes?: number;
  favorites?: number;
  userRating?: number | null;
  userFavorite?: boolean;
}

export interface Project extends ProductStats {
  _id: string;
  title: string;
  category: string | Category;
  images: string[];
  description: string;
  price?: number;
  material?: string;
  dimensions?: string;
  details?: string[];
  hidden?: boolean;
  bestSeller?: boolean;
  order?: number;
  createdAt?: string;
}

export type ProjectInput = Omit<Project, '_id' | keyof ProductStats | 'order' | 'createdAt'>;

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  isAdmin?: boolean;
  createdAt?: string;
  lockoutUntil?: string | null;
}

export interface Review {
  _id: string;
  username: string;
  rating: number;
  text: string;
  approved?: boolean;
  createdAt: string;
}

export type QuoteStatus = 'new' | 'in_progress' | 'done' | 'rejected';

export interface QuoteRequest {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  product?: { _id: string; title: string; images?: string[] } | null;
  file?: { url?: string; name?: string; size?: number };
  status: QuoteStatus;
  adminNote?: string;
  createdAt: string;
}

export interface AdminStats {
  users: number;
  newUsers: number;
  projects: number;
  hiddenProjects: number;
  categories: number;
  reviews: number;
  pendingReviews: number;
  quotes: number;
  newQuotes: number;
  favorites: number;
  averageReview: number;
  topRated: { _id: string; title: string; image?: string; avg: number; votes: number }[];
  latestQuotes: Pick<QuoteRequest, '_id' | 'name' | 'phone' | 'status' | 'createdAt' | 'file'>[];
  latestReviews: Review[];
}

export const categoryIdOf = (project: Pick<Project, 'category'>): string =>
  !project.category ? '' : typeof project.category === 'string' ? project.category : project.category._id;

export const categoryNameOf = (project: Pick<Project, 'category'>, categories: Category[] = []): string => {
  if (project.category && typeof project.category === 'object' && project.category.name) return project.category.name;
  return categories.find((c) => c._id === categoryIdOf(project))?.name || '';
};

const toPayload = (proj: ProjectInput) => ({
  title: proj.title.trim(),
  images: proj.images.filter(Boolean),
  category: typeof proj.category === 'string' ? proj.category : proj.category._id,
  description: proj.description || '',
  price: Number(proj.price) || 0,
  material: proj.material || '',
  dimensions: proj.dimensions || '',
  details: (proj.details || []).filter(Boolean),
  hidden: Boolean(proj.hidden),
  bestSeller: Boolean(proj.bestSeller),
});


export const api = {
  // ---------- Auth ----------
  login: (email: string, password: string) =>
    apiFetch<{ user: User }>('/api/auth/login', { method: 'POST', body: { email, password }, noRefresh: true }),
  register: (data: { username: string; email: string; phone: string; password: string }) =>
    apiFetch<{ user: User }>('/api/auth/register', { method: 'POST', body: data, noRefresh: true }),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST', noRefresh: true }),
  me: () => apiFetch<{ user: User }>('/api/auth/me'),

  // ---------- Content ----------
  getCategoryList: () => apiFetch<Category[]>('/api/categories'),
  getProjects: () => apiFetch<Project[]>('/api/projects'),
  getProject: (id: string) => apiFetch<Project>(`/api/projects/${id}`),

  // ---------- Interactions ----------
  saveInteraction: (productId: string, payload: { rating?: number; favorite?: boolean }) =>
    apiFetch<ProductStats & { productId: string }>(`/api/product-interactions/${productId}`, { method: 'POST', body: payload }),
  getFavorites: () => apiFetch<Project[]>('/api/product-interactions/favorites'),

  // ---------- Reviews ----------
  getReviews: async () => (await apiFetch<{ reviews: Review[] }>('/api/reviews')).reviews,
  addReview: (rating: number, text: string) =>
    apiFetch<{ message: string; review: Review }>('/api/reviews', { method: 'POST', body: { rating, text } }),

  // ---------- Chat ----------
  chat: (messages: { role: 'user' | 'model'; text: string }[]) =>
    apiFetch<{ text: string }>('/api/chat', { method: 'POST', body: { messages } }),

  // ---------- Quotes ----------
  sendQuote: (form: FormData) => apiFetch<{ message: string }>('/api/quotes', { method: 'POST', body: form }),

  // ---------- Admin ----------
  admin: {
    stats: () => apiFetch<AdminStats>('/api/admin/stats'),
    projects: () => apiFetch<Project[]>('/api/projects/admin'),
    createProject: (proj: ProjectInput) => apiFetch<Project>('/api/projects', { method: 'POST', body: toPayload(proj) }),
    updateProject: (id: string, proj: ProjectInput) =>
      apiFetch<Project>(`/api/projects/${id}`, { method: 'PUT', body: toPayload(proj) }),
    setProjectHidden: (id: string, hidden: boolean) =>
      apiFetch<Project>(`/api/projects/${id}/visibility`, { method: 'PATCH', body: { hidden } }),
    setProjectBestSeller: (id: string, bestSeller: boolean) =>
      apiFetch<Project>(`/api/projects/${id}/best-seller`, { method: 'PATCH', body: { bestSeller } }),
    reorderProjects: (ids: string[]) => apiFetch('/api/projects/reorder', { method: 'PUT', body: { ids } }),
    deleteProject: (id: string) => apiFetch(`/api/projects/${id}`, { method: 'DELETE' }),

    createCategory: (cat: Omit<Category, '_id'>) => apiFetch<Category>('/api/categories', { method: 'POST', body: cat }),
    updateCategory: (cat: Category) =>
      apiFetch<Category>(`/api/categories/${cat._id}`, { method: 'PUT', body: { name: cat.name, image: cat.image } }),
    deleteCategory: (id: string) => apiFetch(`/api/categories/${id}`, { method: 'DELETE' }),

    uploadImage: async (file: File) => {
      const form = new FormData();
      form.append('image', file);
      const data = await apiFetch<{ url: string }>('/api/upload', { method: 'POST', body: form });
      if (!data.url) throw new Error('لم يُرجع الخادم رابط الصورة');
      return data.url;
    },

    users: async () => (await apiFetch<{ users: AdminUser[] }>('/api/auth/users')).users,
    deleteUser: (id: string) => apiFetch(`/api/auth/users/${id}`, { method: 'DELETE' }),

    reviews: async () => (await apiFetch<{ reviews: Review[] }>('/api/reviews/admin')).reviews,
    setReviewApproved: (id: string, approved: boolean) =>
      apiFetch(`/api/reviews/${id}`, { method: 'PATCH', body: { approved } }),
    deleteReview: (id: string) => apiFetch(`/api/reviews/${id}`, { method: 'DELETE' }),

    quotes: async () => (await apiFetch<{ quotes: QuoteRequest[] }>('/api/quotes')).quotes,
    updateQuote: (id: string, data: { status: QuoteStatus; adminNote?: string }) =>
      apiFetch<{ quote: QuoteRequest }>(`/api/quotes/${id}`, { method: 'PATCH', body: data }),
    deleteQuote: (id: string) => apiFetch(`/api/quotes/${id}`, { method: 'DELETE' }),
  },
};
