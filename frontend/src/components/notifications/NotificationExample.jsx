import React from 'react';
import { Button } from '../ui/Button';
import { useNotification } from './index';

const NotificationExample = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const handleSuccess = () => {
    showSuccess('This is a success message!');
  };

  const handleError = () => {
    showError('This is an error message!');
  };

  const handleWarning = () => {
    showWarning('This is a warning message!');
  };

  const handleInfo = () => {
    showInfo('This is an info message!');
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Notification Examples</h3>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSuccess} variant="success">
          Show Success
        </Button>
        <Button onClick={handleError} variant="error">
          Show Error
        </Button>
        <Button onClick={handleWarning} variant="warning">
          Show Warning
        </Button>
        <Button onClick={handleInfo} variant="info">
          Show Info
        </Button>
      </div>
    </div>
  );
};

export default NotificationExample;