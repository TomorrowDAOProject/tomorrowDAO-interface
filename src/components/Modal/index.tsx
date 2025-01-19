import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ReactComponent as Close } from 'assets/revamp-icon/modal-close.svg';

interface IModalProps {
  isVisible: boolean;
  children: ReactNode | ReactNode[];
  rootClassName?: string;
  title?: string;
  onClose?: () => void;
}

const Modal: React.FC<IModalProps> = ({ isVisible, children, rootClassName, title, onClose }) => {
  // Variants for the modal animation
  const variants = {
    hidden: { opacity: 0, scale: 0.75 },
    visible: { opacity: 1, scale: 1 },
  };

  return isVisible ? (
    <div className="fixed votigram-grid inset-0 bg-[rgba(0,0,0,0.7)] flex justify-center items-center z-[10000]">
      <motion.div
        className={clsx(
          `bg-darkBg border border-solid border-fillBg8 rounded-lg shadow-lg w-full max-w-[calc(100vw-40px)]`,
          rootClassName,
        )}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={variants}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <div className="flex items-center justify-center text-[20px] relative">
          <span className="text-white">{title}</span>
          <Close className="absolute top-0 right-0 cursor-pointer" onClick={onClose} />
        </div>
        {children}
      </motion.div>
    </div>
  ) : null;
};

export default Modal;
