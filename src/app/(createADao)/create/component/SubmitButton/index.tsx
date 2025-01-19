import React, { useCallback, useContext, useState, forwardRef, useImperativeHandle } from 'react';
import CreatePreviewModal, { ICreatePreviewModalProps } from '../CreatePreviewModal';
import CommonOperationResultModal, {
  CommonOperationResultModalType,
  TCommonOperationResultModalProps,
} from 'components/CommonOperationResultModal';
import { StepEnum, StepsContext } from '../../type';
import Button from 'components/Button';

interface ISubmitButtonProps {
  children?: React.ReactNode;
  onConfirm?: () => void;
}

type TPreviewModalConfig = Pick<ICreatePreviewModalProps, 'open'>;

const INIT_PREVIEW_MODAL_CONFIG: TPreviewModalConfig = {
  open: false,
};

const INIT_RESULT_MODAL_CONFIG: TCommonOperationResultModalProps = {
  open: false,
  type: CommonOperationResultModalType.Success,
  primaryContent: '',
  secondaryContent: '',
};
export interface ISubmitRef {
  setResultModalConfig: (value: TCommonOperationResultModalProps) => void;
  initResultModalConfig: () => void;
}
const SubmitButton = forwardRef<ISubmitRef, ISubmitButtonProps>(
  ({ children, onConfirm }: ISubmitButtonProps, ref) => {
    const [previewModalConfig, setPreviewModalConfig] = useState(INIT_PREVIEW_MODAL_CONFIG);
    const [resultModalConfig, setResultModalConfig] = useState(INIT_RESULT_MODAL_CONFIG);

    const { stepForm } = useContext(StepsContext);

    const handleCreate = useCallback(() => {
      setPreviewModalConfig({
        open: false,
      });
      onConfirm?.();
    }, [onConfirm]);

    useImperativeHandle(ref, () => ({
      setResultModalConfig,
      initResultModalConfig: () => {
        setResultModalConfig(INIT_RESULT_MODAL_CONFIG);
      },
    }));

    return (
      <>
        <Button
          type="primary"
          onClick={() => {
            stepForm[StepEnum.step3].formInstance?.trigger().then(() => {
              setPreviewModalConfig({
                open: true,
              });
            });
          }}
        >
          {children || 'Submit'}
        </Button>
        <CreatePreviewModal
          {...previewModalConfig}
          onClose={() =>
            setPreviewModalConfig({
              open: false,
            })
          }
          onConfirm={handleCreate}
        />
        <CommonOperationResultModal
          {...resultModalConfig}
          onCancel={() => {
            setResultModalConfig(INIT_RESULT_MODAL_CONFIG);
          }}
        />
      </>
    );
  },
);

export default SubmitButton;
