import React, { useMemo } from "react";
import { If, Then, Else } from "react-if";
import { Spin, Divider, Modal, Button } from "antd";
import Dividends from "../../_src/components/Dividends";

import "./index.css";

function getTokenCounts(dividend) {
  const { amounts = [] } = dividend;
  return (amounts || []).map((item) =>
    Object.keys(item.amounts || {}).reduce(
      (acc, key) => acc + item.amounts[key],
      0
    )
  );
}

const DividendModal = (props) => {
  const {
    dividendModalVisible,
    changeModalVisible,
    dividends,
    handleClaimDividendClick,
    loading,
    claimLoading,
    claimDisabled,
  } = props;
  const tokenCounts = useMemo(() => getTokenCounts(dividends), [dividends]);
  return (
    <Modal
      className="dividend-modal governance-rewards-modal"
      title="Governance Rewards"
      visible={dividendModalVisible}
      onOk={() => {
        changeModalVisible("dividendModalVisible", false);
      }}
      onCancel={() => {
        changeModalVisible("dividendModalVisible", false);
      }}
      okText="Get!"
      width={543}
      centered
      maskClosable
      keyboard
      footer={null}
    >
      <If condition={!!loading}>
        <Then>
          <Spin spinning={loading} />
        </Then>
        <Else>
          <div>
            <Divider className="mt-[30px] mb-[30px] bg-borderColor" />
            {dividends.amounts.map((item, index) => (
              <div
                key={item.type}
                className="claim-profit-item"
                justify="space-between"
              >
                <div className="text-left">
                  <span className="profit-item-key">{item.title}: </span>
                  <Dividends
                    className="profit-item-value"
                    valueClassName="text-lightGrey"
                    buttonClassName="!rounded-[12px] !text-white text-[11px] font-medium !bg-mainColor hover:!bg-darkBg hover:!text-mainColor hover:!border hover:border-solid hover:!border-mainColor"
                    dividends={item.amounts}
                  />
                </div>
                <Button
                  disabled={tokenCounts[index] === 0 || claimDisabled}
                  type="primary"
                  loading={claimLoading[item.title]}
                  onClick={() => {
                    handleClaimDividendClick(item);
                  }}
                  size="small"
                  className="!rounded-[12px] !text-white text-[11px] font-medium !bg-mainColor hover:!bg-darkBg hover:!text-mainColor hover:!border hover:border-solid hover:!border-mainColor"
                >
                  Claim Rewards
                </Button>
              </div>
            ))}
          </div>
        </Else>
      </If>
    </Modal>
  );
};

export default DividendModal;
