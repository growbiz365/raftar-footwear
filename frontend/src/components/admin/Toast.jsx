import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastCtx = createContext(null);

export function useToast() {
  return useContext(ToastCtx);
}

let idCounter = 0;

const TYPES = {
  success: { icon: CheckCircle2, cls: 'bg-emerald-600' },
  error: { icon: XCircle, cls: 'bg-rose-600' },
  info: { icon: Info, cls: 'bg-[#0b4f86]' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [pending, setPending] = useState(null);

  const toast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++idCounter;
    setToasts((arr) => [...arr, { id, message, type }]);
    setTimeout(() => setToasts((arr) => arr.filter((t) => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const confirm = useCallback((message, label = 'Delete') => new Promise((resolve) => {
    const id = ++idCounter;
    setPending({ id, message, label, resolve });
  }), []);

  const resolveConfirm = (val) => {
    const r = pending?.resolve;
    setPending(null);
    if (r) r(val);
  };

  return (
    <ToastCtx.Provider value={{ toast, dismiss, confirm }}>
      {children}

      {pending && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-sm">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl px-5 py-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-rose-500 shrink-0" />
              <p className="text-sm font-medium text-gray-800">{pending.message}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => resolveConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => resolveConfirm(true)}
                className={`px-4 py-2 text-sm rounded-lg font-medium text-white ${pending.label === 'Delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#0b4f86] hover:bg-[#083d6a]'}`}
              >
                {pending.label}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-5 right-5 z-[100] space-y-2">
        {toasts.map((t) => {
          const T = TYPES[t.type] || TYPES.success;
          return (
            <div
              key={t.id}
              className={`${T.cls} text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 max-w-sm animate-[fadeIn_.2s_ease]`}
            >
              <T.icon size={18} className="shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100 shrink-0">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}