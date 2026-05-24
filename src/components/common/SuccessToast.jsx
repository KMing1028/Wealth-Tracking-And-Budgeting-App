import React, { useEffect } from 'react';

export default function SuccessToast({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="success-toast-overlay">
      <div className="success-toast">
        <div className="success-toast-icon">✅</div>
        <p className="success-toast-msg">{message}</p>
      </div>
    </div>
  );
}
