import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { toast } from 'react-toastify';

interface HashAddress {
  preLen?: number;
  endLen?: number;
  className?: string;
  address: string;
  chain?: string;
  size?: string;
  primaryIconColor?: string;
  addressHoverColor?: string;
  addressActiveColor?: string;
  ignorePrefixSuffix?: boolean;
  iconSize?: string;
  iconColor?: string;
}

const HashAddress = ({
  address,
  preLen,
  endLen,
  chain,
  className,
  ignorePrefixSuffix,
  iconSize,
  iconColor,
}: HashAddress) => {
  const realAddress = `${ignorePrefixSuffix ? '' : 'ELF_'}${address}${chain ? `_${chain}` : ''}`;
  const firstPart = preLen && realAddress.slice(0, preLen);
  const lastPart = endLen && realAddress.slice(-endLen);
  const showAddress = preLen && endLen ? `${firstPart}...${lastPart}` : realAddress;

  const textColorClass = iconColor ? `text-[${iconColor}]` : 'text-white';
  const iconSizeClass = iconSize ? `text-[${iconSize}]` : 'text-[20px]';

  const handleCopy = () => {
    try {
      copy(realAddress);
      toast.success('Copy success');
    } catch (e) {
      toast.error('Copy failed.');
    }
  };
  return (
    <div className={`font-[400] flex items-center gap-1 text-[14px] ${className}`}>
      <span className="break-all">{showAddress}</span>
      <i
        className={clsx(
          'tmrwdao-icon-duplicate cursor-pointer hover:text-white',
          textColorClass,
          iconSizeClass,
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleCopy();
        }}
      />
    </div>
  );
};
export default HashAddress;
