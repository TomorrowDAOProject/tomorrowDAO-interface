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
        'border border-Neutral-Divider border-solid rounded-lg bg-white lg:px-8 py-6 px-4 ',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default memo(BoxWrapper);
