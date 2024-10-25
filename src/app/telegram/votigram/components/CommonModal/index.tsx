import { Modal } from 'antd';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import './index.css';
import { CloseIcon } from 'components/Icons';

interface ICommonModalProps {
  content: React.ReactNode;
  title: string;
  showCloseIcon?: boolean;
}
export interface ICommonModalRef {
  open: () => void;
  close: () => void;
}
const CommonModal = forwardRef((props: ICommonModalProps, ref) => {
  const { showCloseIcon = true } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  useImperativeHandle(ref, () => ({
    open: () => {
      setIsModalOpen(true);
    },
    close: () => {
      setIsModalOpen(false);
    },
  }));
  return (
    <Modal
      title={null}
      open={isModalOpen}
      footer={null}
      closeIcon={null}
      centered
      wrapClassName="tg-common-modal"
    >
      <div className="tg-common-modal-header">
        <div className="title">{props.title}</div>
        {showCloseIcon && (
          <CloseIcon
            onClick={() => {
              setIsModalOpen(false);
            }}
          />
        )}
      </div>
      <div className="tg-common-modal-content">{props.content}</div>
    </Modal>
  );
});

export default CommonModal;
