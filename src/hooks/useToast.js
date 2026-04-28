import { useRef, useState, useCallback } from 'react';

const useToast = () => {
  const [toast, setToast] = useState({ visible: false, text: '', type: 'error' });
  const timerRef = useRef(null);

  const showToast = useCallback((text, type = 'error') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ visible: true, text, type });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

  return { toast, showToast };
};

export default useToast;
