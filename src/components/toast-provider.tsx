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
      <div className="pointer-events-none fixed right-[18px] top-[18px] z-[100] grid w-[min(390px,calc(100vw-36px))] gap-2 max-[600px]:right-2.5 max-[600px]:top-2.5 max-[600px]:w-[calc(100vw-20px)]" aria-live="polite" aria-atomic="true">
        {toast && (
          <div
            className={`pointer-events-auto flex items-start gap-2.5 rounded-[10px] border bg-white px-4 py-3 text-[13px] leading-relaxed shadow-[0_9px_28px_rgb(26_42_31_/_16%)] ${toast.variant === "success" ? "border-[#b9dfc6] text-[#176d37]" : "border-[#f0c4bf] text-[#a22d25]"}`}
            role={toast.variant === "error" ? "alert" : "status"}
          >
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full font-extrabold ${toast.variant === "success" ? "bg-[#e4f5e9]" : "bg-[#fff0ee]"}`} aria-hidden="true">
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
