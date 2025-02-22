import ConfirmModal from "../ConfirmModal";

interface IOnlyOkModal {
  message: string;
}
export const onlyOkModal = ({ message }: IOnlyOkModal) => {
  ConfirmModal.confirm({
    content: message,
    okText: 'OK',
    showCancel: false,
  });
};

export const showAccountInfoSyncingModal = () => {
  onlyOkModal({
    message: "Synchronizing on-chain account information...",
  });
};
