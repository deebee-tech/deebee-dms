import type { Toast } from "$lib/models/toast";

const createToastStore = () => {
   const toastState = $state<Toast[]>([]);

   const addToast = (toast: Toast) => {
      toastState.push(toast);
   };

   const clearToasts = () => {
      toastState.length = 0;
   };

   const getToastDuration = (id: string): number | undefined => {
      const toast = toastState.find((t) => t.id === id);
      return toast ? toast.duration : undefined;
   };

   const removeToast = (id: string) => {
      const index = toastState.findIndex((t) => t.id === id);
      if (index !== -1) {
         toastState.splice(index, 1);
      }
   };

   const setTimerDuration = (id: string, duration: number) => {
      const toast = toastState.find((t) => t.id === id);
      if (toast) {
         toast.duration = duration;
      }
   };

   return {
      get toasts() {
         return toastState;
      },
      addToast,
      getToastDuration,
      removeToast,
      clearToasts,
      setTimerDuration,
   };
};

export const toastStore = createToastStore();
