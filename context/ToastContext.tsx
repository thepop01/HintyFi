import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  projectIconUrl?: string;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, projectIconUrl?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="text-green-400" size={20} />,
  error: <XCircle className="text-red-400" size={20} />,
  info: <Info className="text-blue-400" size={20} />,
  warning: <AlertTriangle className="text-yellow-400" size={20} />,
};

const BG_COLORS: Record<ToastType, string> = {
    success: 'bg-[rgb(var(--color-surface-container))] border-green-500/50 text-on-surface',
    error: 'bg-[rgb(var(--color-surface-container))] border-red-500/50 text-on-surface',
    info: 'bg-[rgb(var(--color-surface-container))] border-blue-500/50 text-on-surface',
    warning: 'bg-[rgb(var(--color-surface-container))] border-yellow-500/50 text-on-surface',
}

// FIX: Removed React.FC to align with modern React patterns and resolve hook-related errors.
// FIX: Changed to React.PropsWithChildren to ensure children prop is correctly typed.
export const ToastProvider = ({ children }: React.PropsWithChildren) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType, projectIconUrl?: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, projectIconUrl }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-36 right-4 z-50">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-2 p-2 mb-2 rounded-lg shadow-lg border ${BG_COLORS[toast.type]}`}
            >
              {toast.projectIconUrl ? (
                <img src={toast.projectIconUrl} alt="Project Icon" className="w-5 h-5 rounded-full" />
              ) : (
                ICONS[toast.type]
              )}
              <span className="font-medium text-sm">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};