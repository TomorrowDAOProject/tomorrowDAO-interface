import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface IModalProps {
  isVisible: boolean;
  children: ReactNode | ReactNode[];
  rootClassName?: string;
  title?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  closeable?: boolean;
}

const Modal: React.FC<IModalProps> = ({
  isVisible,
  children,
  rootClassName,
  title,
  footer,
  onClose,
  closeable = true,
}) => {
  // Variants for the modal animation
  const variants = {
    hidden: { opacity: 0, scale: 0.75 },
    visible: { opacity: 1, scale: 1 },
  };

  return isVisible ? (
    <div className="fixed votigram-grid inset-0 bg-[rgba(0,0,0,0.7)] flex justify-center items-center z-[10000]">
      <motion.div
        className={clsx(
          `relative bg-darkBg border border-solid border-fillBg8 rounded-lg shadow-lg w-full max-w-[calc(100vw-40px)] max-h-[calc(100vh-44px)] overflow-y-auto`,
          rootClassName,
        )}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={variants}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {title && (
          <div className="flex items-center justify-center text-[20px] relative">
            <span className="text-white font-Unbounded font-light">{title}</span>
          </div>
        )}
        {closeable && (
          <i
            className="absolute tmrwdao-icon-plus text-white rotate-45 text-[28px] top-[18px] md:top-[27px] right-[18px] md:right-[35px] cursor-pointer"
            onClick={onClose}
          />
        )}
        {children}
        {footer}
      </motion.div>
    </div>
  ) : null;
};

export default Modal;
