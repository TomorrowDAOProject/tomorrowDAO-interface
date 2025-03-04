import ConfirmModal from "../ConfirmModal";

interface IOnlyOkModal {
  title?: string;
  titleClassName?: string;
  message: string;
  contentClassName?: string;
}
export const onlyOkModal = ({ message, contentClassName, title, titleClassName }: IOnlyOkModal) => {
  ConfirmModal.confirm({
    title: title,
    titleClassName,
    content: message,
    contentClassName,
    okText: 'OK',
    showCancel: false,
  });
};

export const showAccountInfoSyncingModal = () => {
  onlyOkModal({
    message: "Synchronizing on-chain account information...",
  });
};
