import React from "react";
import Modal from "components/Modal";
import Button from "components/Button";

const ContractProposalModal = ({ applyModal, contractModalCancle }) => (
  <Modal
    closable={false}
    width={720}
    footer={
      <Button className="w-full" type="primary" onClick={contractModalCancle}>
        OK
      </Button>
    }
    {...applyModal}
    onOk={contractModalCancle}
    onCancel={contractModalCancle}
  />
);

export default ContractProposalModal;
