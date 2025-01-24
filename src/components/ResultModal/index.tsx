import React, { useEffect, useState } from 'react';
import { IButtonProps } from 'aelf-design';
import CommonOperationResultModal, {
  CommonOperationResultModalType,
  TCommonOperationResultModalProps,
} from 'components/CommonOperationResultModal';
import { eventBus, ResultModal } from 'utils/myEvent';
import Button from 'components/Button';

type TResultModalConfig = Pick<
  TCommonOperationResultModalProps,
  'open' | 'type' | 'primaryContent' | 'secondaryContent' | 'footerConfig'
>;

export const INIT_RESULT_MODAL_CONFIG: TResultModalConfig = {
  open: false,
  type: CommonOperationResultModalType.Success,
  primaryContent: '',
  secondaryContent: '',
};
const ResultModalComponent = () => {
  const [resultModalConfig, setResultModalConfig] = useState(INIT_RESULT_MODAL_CONFIG);
  useEffect(() => {
    const handleResultModal = (config: TResultModalConfig) => {
      setResultModalConfig(config);
    };
    eventBus.addListener(ResultModal, handleResultModal);
    return () => {
      eventBus.removeListener(ResultModal, handleResultModal);
    };
  }, []);

  return (
    <CommonOperationResultModal
      {...resultModalConfig}
      onCancel={() => {
        setResultModalConfig(INIT_RESULT_MODAL_CONFIG);
      }}
    />
  );
};
export const okButtonConfig: IButtonProps = {
  children: (
    <Button
      type="primary"
      className="w-full"
      onClick={() => {
        eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
      }}
    >
      OK
    </Button>
  ),
};

export const WarningButtonList: IButtonProps[] = [
  {
    children: (
      <Button
        type="default"
        className="flex-1"
        onClick={() => {
          eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
        }}
      >
        Exit Now
      </Button>
    ),
  },
  {
    children: (
      <Button
        type="primary"
        className="flex-1"
        onClick={() => {
          eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
        }}
      >
        No
      </Button>
    ),
  },
];

export default ResultModalComponent;
