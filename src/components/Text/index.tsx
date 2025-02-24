import { useCopyToClipboard } from 'react-use';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { shortenFileName } from 'utils/file';
import { useLandingPageResponsive } from 'hooks/useResponsive';

interface ITextProps {
  content: string;
  copyable?: boolean;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  isAddress?: boolean;
  shortAddress?: boolean;
}

export default function Text({
  content,
  copyable,
  className,
  textClassName,
  iconClassName,
  isAddress,
  shortAddress,
}: ITextProps) {
  const { isPhone } = useLandingPageResponsive();
  const [, setCopied] = useCopyToClipboard();
  const handleCopy = () => {
    setCopied(content);
    toast.success('Copy success');
  };
  return (
    <span className={clsx('inline-flex flex-row items-center gap-x-2', className)}>
      <span
        className={clsx(
          'inline-block whitespace-normal break-all text-lightGrey text-descM14 font-Montserrat font-normal',
          textClassName,
        )}
      >
        {isAddress
          ? shortAddress
            ? shortenFileName(content, 20, isPhone ? 8 : 16, isPhone ? 8 : 16)
            : content
          : content}
      </span>
      {copyable && (
        <i
          className={clsx(
            'tmrwdao-icon-duplicate text-white text-[20px] cursor-pointer',
            iconClassName,
          )}
          onClick={handleCopy}
        />
      )}
    </span>
  );
}
