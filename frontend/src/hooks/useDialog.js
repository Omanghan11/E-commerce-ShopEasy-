import { useState } from 'react';

export const useDialog = () => {
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: null
  });

  const showDialog = ({
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
    onConfirm = null
  }) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      showCancel,
      onConfirm
    });
  };

  const hideDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Convenience methods
  const showAlert = (message, title = 'Alert') => {
    showDialog({
      title,
      message,
      type: 'info',
      confirmText: 'OK',
      showCancel: false
    });
  };

  const showError = (message, title = 'Error') => {
    showDialog({
      title,
      message,
      type: 'error',
      confirmText: 'OK',
      showCancel: false
    });
  };

  const showSuccess = (message, title = 'Success') => {
    showDialog({
      title,
      message,
      type: 'success',
      confirmText: 'OK',
      showCancel: false
    });
  };

  const showWarning = (message, title = 'Warning') => {
    showDialog({
      title,
      message,
      type: 'warning',
      confirmText: 'OK',
      showCancel: false
    });
  };

  const showConfirm = (message, onConfirm, title = 'Confirm') => {
    showDialog({
      title,
      message,
      type: 'confirm',
      confirmText: 'Yes',
      cancelText: 'No',
      showCancel: true,
      onConfirm
    });
  };

  return {
    dialog,
    showDialog,
    hideDialog,
    showAlert,
    showError,
    showSuccess,
    showWarning,
    showConfirm
  };
};

export default useDialog;