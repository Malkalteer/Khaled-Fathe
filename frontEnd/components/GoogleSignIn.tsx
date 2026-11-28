import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/Toast';

// أنواع مبسطة لمكتبة Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string; use_fedcm_for_prompt?: boolean }) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

let clientIdPromise: Promise<string | null> | null = null;
const getClientId = () => {
  if (!clientIdPromise) clientIdPromise = api.authConfig().then((c) => c.googleClientId).catch(() => null);
  return clientIdPromise;
};

let scriptPromise: Promise<void> | null = null;
const loadGoogleScript = () => {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) return resolve();
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('تعذر تحميل خدمة جوجل'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
};

/** زر «المتابعة باستخدام جوجل». لا يظهر إذا لم يُضبط GOOGLE_CLIENT_ID على الخادم. */
const GoogleSignIn: React.FC<{ redirectTo?: string; divider?: boolean }> = ({ redirectTo, divider = true }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const clientId = await getClientId();
      if (!clientId || cancelled) return;
      try {
        await loadGoogleScript();
      } catch {
        return;
      }
      if (cancelled || !ref.current || !window.google) return;
      setEnabled(true);
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setBusy(true);
          try {
            const user = await loginWithGoogle(credential);
            toast.success(`أهلاً ${user.username} 👋`);
            navigate(redirectTo || (user.isAdmin ? '/admin' : '/'), { replace: true });
          } catch (error) {
            toast.error(error);
          } finally {
            setBusy(false);
          }
        },
      });
      const width = Math.min(ref.current.parentElement?.clientWidth || 360, 400);
      window.google.accounts.id.renderButton(ref.current, {
        type: 'standard',
        theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        locale: 'ar',
        width,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, navigate, redirectTo, toast]);

  return (
    <div className={enabled ? '' : 'hidden'} aria-busy={busy}>
      {divider && (
        <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" /> أو <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>
      )}
      <div className={`flex justify-center ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        <div ref={ref} />
      </div>
    </div>
  );
};

export default GoogleSignIn;
