import React from 'react';
import { CheckCircle, Info, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast-item">
          {t.type === 'success' && <CheckCircle size={18} color="#00e5a3" />}
          {t.type === 'info' && <Info size={18} color="#f3db47" />}
          {t.type === 'error' && <AlertCircle size={18} color="#ff2a85" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
