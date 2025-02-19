import clsx from 'clsx';
import LoadingComponent from 'components/LoadingComponent';
import './index.css';

interface ISpinProps {
  spinning: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Spin({ spinning, className, children }: ISpinProps) {
  return (
    <div className={clsx('relative', className)}>
      {children}
      {spinning && <LoadingComponent className="absolute top-0 left-0 bottom-0 right-0 z-10" />}
    </div>
  );
}
