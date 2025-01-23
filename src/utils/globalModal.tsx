import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import { eventBus, ResultModal } from 'utils/myEvent';
import { INIT_RESULT_MODAL_CONFIG } from 'components/ResultModal';
import React from 'react';

interface ShowSuccessModalParams {
  primaryContent: React.ReactNode;
  secondaryContent?: React.ReactNode;
  transactionId?: string;
  onOk?: () => void;
}
export const showSuccessModal = (params: ShowSuccessModalParams) => {
  const { primaryContent, secondaryContent, transactionId } = params;
  eventBus.emit(ResultModal, {
    open: true,
    type: CommonOperationResultModalType.Success,
    primaryContent: primaryContent,
    secondaryContent: secondaryContent,
    footerConfig: {
      buttonList: [
        {
          onClick: () => {
            eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
            params.onOk?.();
          },
          children: 'OK',
          type: 'primary',
        },
      ],
    },
    viewTransactionId: transactionId,
  });
};

export const showErrorModal = (primaryContent: string, secondaryContent: string) => {
  eventBus.emit(ResultModal, {
    open: true,
    type: CommonOperationResultModalType.Error,
    primaryContent: primaryContent,
    secondaryContent: secondaryContent,
    footerConfig: {
      buttonList: [
        {
          children: <span>OK</span>,
          onClick: () => {
            eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
          },
        },
      ],
    },
  });
};
