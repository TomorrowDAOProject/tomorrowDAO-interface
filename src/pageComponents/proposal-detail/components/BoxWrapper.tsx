import { memo } from 'react';
import cls from 'clsx';

interface IBoxWrapperProps {
  children: React.ReactNode;
  className?: string;
}
const BoxWrapper = ({ children, className }: IBoxWrapperProps) => {
  return (
    <div
      className={cls(
        'border border-fillBg8 border-solid rounded-lg bg-darkBg px-6 py-[25px]',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default memo(BoxWrapper);
