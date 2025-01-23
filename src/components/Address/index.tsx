import { useCopyToClipboard } from 'react-use';
import './index.css';
import { toast } from 'react-toastify';
interface IAddress {
  address: string;
  info?: string;
}

export default function Address({ address, info }: IAddress) {
  const [, setCopied] = useCopyToClipboard();
  const handleCopy = () => {
    setCopied(address);
    toast.success('Copy success');
  };
  return (
    <>
      <div className="w-full flex flex-row items-center justify-between border border-solid border-fillBg16 rounded-[8px] px-[16px] py-[13px] bg-fillBg8">
        <span className="inline-block max-w-[calc(100%-60px)] whitespace-normal break-words text-lightGrey text-descM14 font-Montserrat font-normal">
          {address}
        </span>
        <i
          className="tmrwdao-icon-duplicate text-white text-[20px] cursor-pointer"
          onClick={handleCopy}
        />
      </div>
      {info && <div className="mt-2 text-desc12 text-lightGrey font-Montserrat">{info}</div>}
    </>
  );
}
