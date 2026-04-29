import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  const Icon = variant === 'danger' ? Trash2 : variant === 'warning' ? AlertTriangle : AlertCircle;
  const iconColor =
    variant === 'danger'
      ? 'text-error'
      : variant === 'warning'
        ? 'text-warning'
        : 'text-accent-primary';
  const iconBg =
    variant === 'danger'
      ? 'bg-error-bg'
      : variant === 'warning'
        ? 'bg-warning-bg'
        : 'bg-accent-light';
  const buttonClass =
    variant === 'danger'
      ? 'bg-error hover:bg-error/90'
      : variant === 'warning'
        ? 'bg-warning hover:bg-warning/90'
        : 'bg-accent-primary hover:bg-accent-primary/90';

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-2`}>
            <Icon size={24} className={iconColor} />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            className="px-6 py-2.5 font-bold text-text-secondary hover:bg-surface-hover rounded-md transition-colors text-sm"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`px-8 py-2.5 rounded-md text-white font-bold text-sm transition-all ${buttonClass}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
