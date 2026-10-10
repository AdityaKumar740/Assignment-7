"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error";
type ToastMessage = {
  id: number;
  message: string;
  variant: ToastVariant;
};
type ToastContextValue = {
  showToast: (message: string, variant: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const nextToastId = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, variant: ToastVariant) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      const id = ++nextToastId.current;
      setToast({ id, message, variant });
      timeout.current = setTimeout(() => {
        setToast((currentToast) =>
          currentToast?.id === id ? null : currentToast,
        );
        timeout.current = null;
      }, 4000);
    },
    [],
  );

  useEffect(
    () => () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toast && (
          <div
            className={`toast-message is-${toast.variant}`}
            role={toast.variant === "error" ? "alert" : "status"}
          >
            <span aria-hidden="true">
              {toast.variant === "success" ? "✓" : "!"}
            </span>
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider.");
  }
  return context.showToast;
}
