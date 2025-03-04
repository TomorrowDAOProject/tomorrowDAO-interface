// eslint-disable-next-line no-use-before-define
import React from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseCircleFilled,
  CheckCircleFilled,
} from "@ant-design/icons";
import Modal from "components/Modal";
import { explorer, mainExplorer } from "config";
import { useChainSelect } from "hooks/useChainSelect";
import CopylistItem from "../CopylistItem";
import "./index.css";
import Button from "components/Button";
import clsx from "clsx";
// import useMobile from "../../../../hooks/useMobile";

interface IStatus {
  // 0: success 1: fail 2: loading 3: un-arrival
  verification: number;
  execution: number;
}
interface IModalProps {
  isUpdate: boolean;
  transactionId: string;
  message: string;
  status: IStatus;
  cancel: Function;
  title: string;
}
interface IProps {
  open: boolean;
  withoutApprovalProps: IModalProps;
}

const noticeDeployContent = [
  "If the transaction pre-validation fails, fees will not be charged.",
  "If the deployment fails, fees charged will not be returned.",
  "Contract deployment includes 2 phases and takes around 1-10 minutes.",
  "Closing deployment window while it's ongoing will not affect its progress.",
];
const noticeUpdateContent = [
  "If the update fails, fees charged will not be returned.",
  "Contract update includes 2 phases and takes around 1-10 minutes.",
  "Contract deployment includes 2 phases and takes around 1-10 minutes.",
];
const getMessageByExec = (props: IModalProps, isSideChain: Boolean) => {
  const { isUpdate, status, message, transactionId } = props;
  const { execution } = status || {};
  switch (execution) {
    case 2:
      return (
        <div className="font-Unbounded text-[15px] font-light -tracking-[0.6px] text-white text-center">
          {`Executing contract  ${isUpdate ? "update" : "deployment"}...`}
        </div>
      ); 
    case 0:
      return (
        <div className="w-full">
          <div className="flex items-center justify-center gap-2">
            <span className="font-Unbounded text-[15px] font-light -tracking-[0.6px] text-white text-center">{`The contract is ${
              isUpdate ? "updated" : "deployed"
            }!`}</span>
          </div>
          <div className="mt-[30px] font-Montserrat text-desc12 text-white">{message}</div>
        </div>
      );
    case 1:
      return (
        <div className="w-full">
          <div className="flex items-center justify-center gap-2">
            <span className="font-Unbounded text-[15px] font-light -tracking-[0.6px] text-white text-center">
              {`Contract ${isUpdate ? "update" : "deployment"}  failure！`}
            </span>
          </div>
          <div className="mt-[30px] font-Montserrat text-desc12 text-white">{message}</div>
          <CopylistItem
            label="Transaction ID"
            value={transactionId}
            href=""
            valueHref={`${isSideChain ? explorer : mainExplorer}/tx/${transactionId}`}
          />
        </div>
      );
    default:
      return null;
  }
};
const getMessage = (props: IModalProps, isSideChain: boolean) => {
  const { isUpdate, status, message, transactionId, title } = props;
  const { verification } = status || {};
  switch (verification) {
    case 2:
      return (
        <div className="font-Unbounded text-[15px] font-light -tracking-[0.6px] text-white text-center">
          {`Verifying contract ${isUpdate ? "update" : "deployment"}...`}
        </div>
      );
    case 1:
      return (
        <div className="w-full">
          <div className="flex items-center justify-center gap-2">
            <span className="font-Unbounded text-[15px] font-light -tracking-[0.6px] text-white">
              {`${title || `Transaction pre-validation failed!`}`}
            </span>
          </div>
          <div className={`mt-[30px] ${!!title && "text-left"}`}>
            {!!title && <span className="block mb-6 font-Montserrat text-desc12 text-white">Possible causes:</span>}
            <p className="font-Montserrat text-desc12 text-white">{message}</p>
          </div>
          {!!title && (
            <CopylistItem
              label="Transaction ID"
              value={transactionId}
              href=""
              valueHref={`${isSideChain ? explorer : mainExplorer}/tx/${transactionId}`}
            />
          )}
        </div>
      );
    case 0:
      return getMessageByExec(props, isSideChain);
    default:
      return null;
  }
};
const WithoutApprovalModal = (props: IProps) => {
  const { isSideChain } = useChainSelect()
  const { open, withoutApprovalProps } = props;
  const { isUpdate, cancel, status } = withoutApprovalProps;
  const noticeContent = isUpdate ? noticeUpdateContent : noticeDeployContent;
  const handleCancel = () => {
    cancel();
  };
  return (
    <Modal
      isVisible={open}
      onClose={handleCancel}
      rootClassName="w-[calc(100vw-40px)] lg:w-[800px] !px-[38px] !py-[30px]"
      closeable={false}
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          {status?.verification === 1 && (
            <i className="tmrwdao-icon-circle-add text-[32px] text-white rotate-45" />
          )}
          {(status?.verification !== 1) && (  
            <span
              className={clsx(`w-[30px] h-[30px] flex items-center justify-center border border-solid rounded-full text-desc12 font-Montserrat text-white`, {
                "bg-mainColor border-mainColor": status?.verification === 2,
                "bg-transparent border-white": status?.verification !== 2,
              })}
            >
              1
            </span>
          )}
          <span
            className={clsx(`text-desc12 font-Montserrat text-white`)}
          >
            {`${isUpdate ? "Update" : "Deployment"}  verification`}
          </span>
        </div>
        <div className="bg-lightGrey w-[1px] h-[49px] md:h-[1px] md:w-[116px]" />
        <div className="flex items-center gap-2">
          {status?.execution === 1 && (
            <i className="tmrwdao-icon-circle-add text-[32px] text-white rotate-45" />
          )}
          {(status?.execution !== 1) && (
            <span className={clsx(`w-[30px] h-[30px] flex items-center justify-center border border-solid rounded-full text-desc12 font-Montserrat text-white`, {
              "bg-mainColor border-mainColor": status?.execution === 2,
              "bg-transparent border-white": status?.execution !== 2,
            })}
            >
              2
            </span>
          )}
          <span
            className={clsx(`text-desc12 font-Montserrat text-white`)}
          >
            {`${isUpdate ? "Update" : "Deployment"}  execution`}
          </span>
        </div>
      </div>
      <div className="my-[54px]">
        {getMessage(withoutApprovalProps, isSideChain)}
      </div>
      <div className="mb-[50px] bg-borderColor border border-solid border-fillBg8 rounded-[8px] py-2 px-3">
        <span className="mb-[6px] block font-Montserrat text-descM11 text-white">Important Notice: </span>
        <div className="content">
          {noticeContent.map((ele, index) => {
            return (
              <div className="font-Montserrat text-descM11 text-white" key={`notice_${ele}`}>
                <span>{index + 1}.</span>
                <span>{ele}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Button type="primary" className="w-full !py-[11px]" onClick={handleCancel}>
        Close
      </Button>
    </Modal>
  );
};

export default WithoutApprovalModal;
