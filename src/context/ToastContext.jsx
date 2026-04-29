import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ visible: false, text: '', type: 'error' });
  const timerRef = useRef(null);

  const showToast = useCallback((text, type = 'error') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ visible: true, text, type });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast visible={toast.visible} text={toast.text} type={toast.type} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
