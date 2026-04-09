import React from 'react';
import { Modal } from 'antd';
import type { ModalProps } from 'antd';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfirmModalProps extends ModalProps {
  title: string;
  content: React.ReactNode;
  type?: 'warning' | 'danger' | 'info' | 'success';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  content,
  type = 'warning',
  className,
  ...props
}) => {
  const iconColors = {
    warning: 'text-amber-500 bg-amber-50',
    danger: 'text-rose-500 bg-rose-50',
    info: 'text-sky-500 bg-sky-50',
    success: 'text-emerald-500 bg-emerald-50',
  };

  return (
    <Modal
      title={null}
      footer={null}
      centered
      className={cn("confirm-modal", className)}
      {...props}
    >
      <div className="flex flex-col items-center p-6 text-center">
        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-4", iconColors[type])}>
          <AlertCircle size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 mb-8">{content}</p>
        <div className="flex gap-3 w-full">
          <button 
            onClick={props.onCancel as any}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={props.onOk as any}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-white font-semibold transition-colors",
              type === 'danger' ? "bg-rose-500 hover:bg-rose-600" : "bg-primary hover:bg-primary-hover"
            )}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
};
