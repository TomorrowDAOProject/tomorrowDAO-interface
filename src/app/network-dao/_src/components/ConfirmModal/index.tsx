import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from '../Modal';
import Button from '../CustomButton';
import clsx from 'clsx';

interface ConfirmModalProps {
  title?: React.ReactNode;
  titleClassName?: string;
  content: React.ReactNode;
  contentClassName?: string;
  okText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> & {
  confirm: (config: ConfirmModalProps) => void;
} = () => null;

ConfirmModal.confirm = (config: ConfirmModalProps) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const root = ReactDOM.createRoot(div);

  const { title, titleClassName, content, contentClassName, okText = 'OK', cancelText = 'Cancel', onOk, onCancel, showCancel = true } = config;

  const destroy = () => {
    root.unmount();
    div.remove();
  };

  const handleOk = () => {
    onOk?.();
    destroy();
  };

  const handleCancel = () => {
    onCancel?.();
    destroy();
  };

  root.render(
    <Modal
      isVisible
      title={
        title && (
          <div className="flex items-center gap-2">
            <span className={clsx("text-white text-descM18", titleClassName)}>{title}</span>
          </div>
        )
      }
      rootClassName="py-[30px] px-[38px] max-w-[471px] w-[calc(100vw-44px)] md:w-[471px]"
      onClose={handleCancel}
      footer={
        <div className="flex items-center justify-center gap-2">
          {showCancel && (
            <Button type="default" className="flex-1" onClick={handleCancel}>
              {cancelText}
            </Button>
          )}
          <Button type="primary" className="flex-1" onClick={handleOk}>
            {okText}
          </Button>
        </div>
      }
    >
      <div className={clsx("py-[33px] flex items-center justify-center text-descM18 text-white font-Montserrat", contentClassName)}>
        {content}
      </div>
    </Modal>,
  );
};

export default ConfirmModal;
