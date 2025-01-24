import { ReactNode } from 'react';
import successFilledIcon from 'assets/imgs/successFilled.svg';
import errorFilledIcon from 'assets/imgs/errorFilled.svg';
import warningFilledIcon from 'assets/imgs/warningFilled.svg';
import Modal from 'components/Modal';

export enum CommonOperationResultModalType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
}

const ICON_MAP = {
  [CommonOperationResultModalType.Success]: successFilledIcon,
  [CommonOperationResultModalType.Error]: errorFilledIcon,
  [CommonOperationResultModalType.Warning]: warningFilledIcon,
};

type ButtonItem = {
  children: React.ReactNode;
};

export interface TCommonOperationResultModalProps {
  type: CommonOperationResultModalType;
  open: boolean;
  footerConfig?: { buttonList: ButtonItem[] };
  primaryContent: ReactNode;
  secondaryContent?: ReactNode;
  onCancel?(): void;
}

export default function CommonOperationResultModal({
  type = CommonOperationResultModalType.Success,
  open,
  primaryContent,
  secondaryContent,
  onCancel,
  footerConfig,
}: TCommonOperationResultModalProps) {
  return (
    <Modal
      isVisible={open}
      rootClassName="px-[28px] md:px-[38px] py-[30px] md:w-[471px]"
      onClose={onCancel}
    >
      <div className="flex flex-col items-center">
        <img src={ICON_MAP[type]} alt="icon" width={56} height={56} />
        <span className="my-4 block text-descM18 text-white text-center font-Montserrat">
          {primaryContent}
        </span>
        <span className="block font-Montserrat text-desc12 text-center text-lightGrey whitespace-pre-wrap">
          {secondaryContent}
        </span>
        <div className="flex flex-row items-center gap-4 mt-[48px] w-full">
          {footerConfig?.buttonList?.map(({ children }) => (
            <>{children}</>
          ))}
        </div>
      </div>
    </Modal>
  );
}
