import { createContext, useContext, useState } from "react";
import "../styles/Toast.css";

const ToastContext = createContext(null);

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = id => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = (message, type = "info", duration = 2400) => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    window.setTimeout(() => removeToast(id), duration);
  };

  const value = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
