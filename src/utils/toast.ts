import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  },
  
  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: 'top-right',
      }
    );
  },
};

export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(message);
    resolve(confirmed);
  });
};

