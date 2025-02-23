import ConfirmModal from "../ConfirmModal";

interface IOnlyOkModal {
  message: string;
  title?: string;
}
export const onlyOkModal = ({ message, title }: IOnlyOkModal) => {
  ConfirmModal.confirm({
    title: title,
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
