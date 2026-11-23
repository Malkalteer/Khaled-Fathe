import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** يظهر كلوحة جانبية بدل نافذة في المنتصف */
  side?: boolean;
}

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, size = 'md', side = false }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-[90] flex ${side ? 'justify-start' : 'items-end sm:items-center justify-center p-0 sm:p-4'}`} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        className={`relative flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-2xl animate-modal-in ${
          side
            ? 'h-full w-full sm:w-[min(720px,92vw)]'
            : `w-full ${sizes[size]} max-h-[92vh] rounded-t-2xl sm:rounded-2xl`
        }`}
      >
        {title !== undefined && (
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 px-5 py-4">
            <h3 className="text-lg font-bold">{title}</h3>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800" aria-label="إغلاق">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
};

interface ConfirmOptions {
  title: string;
  message?: React.ReactNode;
  confirmText?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<ConfirmFn | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    setState(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (value: boolean) => {
    resolver.current?.(value);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(state)}
        onClose={() => close(false)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => close(false)} className="btn-secondary">إلغاء</button>
            <button onClick={() => close(true)} className={state?.danger ? 'btn-danger' : 'btn-primary'} autoFocus>
              {state?.confirmText || 'تأكيد'}
            </button>
          </div>
        }
      >
        <div className="flex gap-4 py-2">
          {state?.danger && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          )}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">{state?.title}</h4>
            {state?.message && <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{state.message}</div>}
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
};
