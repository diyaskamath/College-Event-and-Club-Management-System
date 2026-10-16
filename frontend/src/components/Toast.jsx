import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useNotification();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => {
        let Icon = Info;
        let className = 'toast';
        if (t.type === 'success') {
          Icon = CheckCircle2;
          className += ' toast-success';
        } else if (t.type === 'error') {
          Icon = AlertCircle;
          className += ' toast-error';
        } else if (t.type === 'warning') {
          Icon = AlertTriangle;
          className += ' toast-warning';
        }

        return (
          <div key={t.id} className={className} role="alert">
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{ color: 'rgba(255,255,255,0.7)', padding: '2px', display: 'flex' }}
              aria-label="Dismiss toast"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
