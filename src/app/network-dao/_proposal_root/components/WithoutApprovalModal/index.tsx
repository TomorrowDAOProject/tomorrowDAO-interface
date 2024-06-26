// eslint-disable-next-line no-use-before-define
import React from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseCircleFilled,
  CheckCircleFilled,
} from "@ant-design/icons";
import { Modal } from "antd";
import { explorer, mainExplorer } from "config";
import { useChainSelect } from "hooks/useChainSelect";
import CopylistItem from "../CopylistItem";
import "./index.css";
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
        <div className="execution-loading">
          {`Executing contract  ${isUpdate ? "update" : "deployment"}...`}
        </div>
      );
    case 0:
      return (
        <div className="execution-success">
          <div className="title">
            <CheckCircleFilled className="circle-icon check" />
            <span className="success-message">{`The contract is ${
              isUpdate ? "updated" : "deployed"
            }!`}</span>
          </div>
          <div className="content">{message}</div>
        </div>
      );
    case 1:
      return (
        <div className="execution-fail">
          <div className="title">
            <CloseCircleFilled className="circle-icon close" />
            <span className="fail-message">
              {`Contract ${isUpdate ? "update" : "deployment"}  failure！`}
            </span>
          </div>
          <div className="content">{message}</div>
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
        <div className="verification-loading">
          {`Verifying contract ${isUpdate ? "update" : "deployment"}...`}
        </div>
      );
    case 1:
      return (
        <div className="verification-fail">
          <div className="title">
            <CloseCircleFilled className="circle-icon close" />
            <span className="fail-message">
              {`${title || `Transaction pre-validation failed!`}`}
            </span>
          </div>
          <div className={`content ${!!title && "text-left"}`}>
            {!!title && <div>Possible causes:</div>}
            <div>{message}</div>
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
  const isMobile = false;
  return (
    <Modal
      destroyOnClose
      width={800}
      open={open}
      onOk={handleCancel}
      okText="Close"
      closable={false}
      wrapClassName={`without-approval-modal ${
        isMobile ? "without-approval-modal-mobile" : ""
      }`}
    >
      <div className="without-approval-modal-degree">
        <div className="deployment-verification">
          {status?.verification === 0 && (
            <CheckCircleOutlined className="circle-icon check" />
          )}
          {status?.verification === 1 && (
            <CloseCircleOutlined className="circle-icon close" />
          )}
          {(status?.verification === 2 || status?.verification === 3) && (
            <span className={`icon icon${status?.verification}`}>1</span>
          )}
          <span className={`title title${status?.verification}`}>
            {`${isUpdate ? "Update" : "Deployment"}  verification`}
          </span>
        </div>
        <div className="middle-line" />
        <div className="deployment-execution">
          {status?.execution === 0 && (
            <CheckCircleOutlined className="circle-icon check" />
          )}
          {status?.execution === 1 && (
            <CloseCircleOutlined className="circle-icon close" />
          )}
          {(status?.execution === 2 || status?.execution === 3) && (
            <span className={`icon icon${status?.execution}`}>2</span>
          )}
          <span className={`title title${status?.execution}`}>
            {`${isUpdate ? "Update" : "Deployment"}  execution`}
          </span>
        </div>
      </div>
      <div className="without-approval-modal-message">
        {getMessage(withoutApprovalProps, isSideChain)}
      </div>
      <div className="without-approval-modal-notice">
        <div className="title">Notice</div>
        <div className="content">
          {noticeContent.map((ele, index) => {
            return (
              <div className="content-item" key={`notice_${ele}`}>
                <span>{index + 1}.</span>
                <span>{ele}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default WithoutApprovalModal;
