import { toast } from 'react-toastify';
export function handleError(message) {
  toast.error(message, {
    position: 'top-right',
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}

export function handleSuccess(message) {
  toast.success(message, {
    position: 'top-right',
    autoClose: 1200,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}
