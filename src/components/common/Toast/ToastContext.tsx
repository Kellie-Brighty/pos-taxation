import React, { createContext, useContext, useState, useCallback } from "react";
import Toast, { ToastVariant } from "./Toast";

interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (message: string, variant: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((currentToasts) => [...currentToasts, { id, message, variant }]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      );
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-in"
            style={{
              animation: "slideIn 0.5s ease-out forwards",
            }}
          >
            <Toast
              message={toast.message}
              variant={toast.variant}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
