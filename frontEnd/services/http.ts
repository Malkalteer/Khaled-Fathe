import { API_URL } from '../lib/config';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const AUTH_EXPIRED_EVENT = 'auth:expired';

let refreshing: Promise<boolean> | null = null;

/** يجدد الجلسة مرة واحدة حتى لو طلبتها عدة طلبات في نفس الوقت */
export const refreshSession = (): Promise<boolean> => {
  if (!refreshing) {
    refreshing = fetch(`${API_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json().catch(() => ({}));
        if (data.user) window.dispatchEvent(new CustomEvent('auth:refreshed', { detail: data.user }));
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

type Options = Omit<RequestInit, 'body'> & {
  body?: unknown;
  /** لا تحاول تجديد الجلسة عند 401 */
  noRefresh?: boolean;
};

/**
 * دالة موحدة لكل طلبات الـ API:
 * - ترسل الكوكيز دائماً
 * - تحوّل الـ JSON تلقائياً (و FormData كما هي)
 * - عند 401 تجدد الجلسة وتعيد الطلب مرة واحدة
 * - ترمي ApiError برسالة عربية مفهومة
 */
export async function apiFetch<T = any>(path: string, options: Options = {}): Promise<T> {
  const { body, noRefresh, headers, ...rest } = options;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const init: RequestInit = {
    credentials: 'include',
    ...rest,
    headers: {
      ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {}),
    },
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(0, 'تعذر الاتصال بالخادم، تحقق من الإنترنت');
  }

  if (res.status === 401 && !noRefresh) {
    const ok = await refreshSession();
    if (ok) return apiFetch<T>(path, { ...options, noRefresh: true });
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, (data && data.message) || 'حدث خطأ غير متوقع');
  }
  return data as T;
}
