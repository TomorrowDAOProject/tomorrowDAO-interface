import React from "react";
import { Modal } from "antd";
import Button from "components/Button";
import "./index.css";

const ContractProposalModal = ({ applyModal, contractModalCancle }) =>  {
  return (
    <Modal
      className="contract-proposal-modal"
      closable={false}
      open={applyModal.visible}
      footer={
        <Button className="w-full" type="primary" size="small" onClick={contractModalCancle}>
          OK
        </Button>
      }
      {...applyModal}
      onOk={contractModalCancle}
      onCancel={contractModalCancle}
    />
  )
};

export default ContractProposalModal;
