"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }, [removeToast]);

    const success = useCallback((message: string) => addToast(message, "success"), [addToast]);
    const error = useCallback((message: string) => addToast(message, "error"), [addToast]);
    const info = useCallback((message: string) => addToast(message, "info"), [addToast]);
    const warning = useCallback((message: string) => addToast(message, "warning"), [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    };

    const bgColors = {
        success: "bg-white border-green-100",
        error: "bg-white border-red-100",
        info: "bg-white border-blue-100",
        warning: "bg-white border-yellow-100",
    };

    return (
        <div className={`pointer-events-auto flex items-center gap-3 p-4 rounded-lg shadow-lg border ${bgColors[toast.type]} min-w-[300px] animate-in slide-in-from-right-full fade-in duration-300`}>
            {icons[toast.type]}
            <p className="text-sm font-medium text-gray-700 flex-1">{toast.message}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
