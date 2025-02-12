import { useCopyToClipboard } from 'react-use';
import { toast } from 'react-toastify';
import clsx from 'clsx';

interface ITextProps {
  content: string;
  copyable?: boolean;
  className?: string;
  textClassName?: string;
}

export default function Text({ content, copyable, className, textClassName }: ITextProps) {
  const [, setCopied] = useCopyToClipboard();
  const handleCopy = () => {
    setCopied(content);
    toast.success('Copy success');
  };
  return (
    <span className={clsx('inline-flex flex-row items-center', className)}>
      <span
        className={clsx(
          'inline-block whitespace-normal break-all text-lightGrey text-descM14 font-Montserrat font-normal',
          textClassName,
        )}
      >
        {content}
      </span>
      {copyable && (
        <i
          className="tmrwdao-icon-duplicate text-white text-[20px] cursor-pointer"
          onClick={handleCopy}
        />
      )}
    </span>
  );
}
