import { useContext } from 'react';
import { ToastContext } from '../context/toastContext';

const useToast = () => useContext(ToastContext);
export default useToast;
