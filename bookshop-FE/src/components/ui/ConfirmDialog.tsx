import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '@/lib/cn';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const iconStyles = {
  danger: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  info: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={cn('grid h-11 w-11 flex-shrink-0 place-items-center rounded-full', iconStyles[type])}>
          <FiAlertTriangle size={22} />
        </div>
        <div className="pt-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
