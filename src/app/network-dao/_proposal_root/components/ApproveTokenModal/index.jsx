/**
 * @file approve token modal
 */
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Decimal from "decimal.js";
import Modal from "components/Modal";
import Button from "components/Button";
import FormItem from "components/FormItem";
import Input from "components/Input";
import { useLandingPageResponsive } from "hooks/useResponsive";
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

import {
  getContractAddress,
  getTxResult,
  sendTransactionWith,
} from "@redux/common/utils";
import constants from "@redux/common/constants";
import { getContract } from "@common/utils";
import "./index.css";
import { toast } from "react-toastify";
import { Controller, useForm } from 'react-hook-form';

const { proposalActions } = constants;

async function getTokenDecimal(aelf, symbol) {
  try {
    const token = await getContract(aelf, getContractAddress("Token"));
    const result = await token.GetTokenInfo.call({
      symbol,
    });
    return result.decimals || 8;
  } catch (e) {
    console.error(e);
    return 8;
  }
}

async function getBalance(aelf, symbol, owner) {
  try {
    const token = await getContract(aelf, getContractAddress("Token"));
    const result = await token.GetBalance.call({
      symbol,
      owner,
    });
    return result.balance || 0;
  } catch (e) {
    console.error(e);
    return 8;
  }
}

async function getAllowance(aelf, params) {
  try {
    const token = await getContract(aelf, getContractAddress("Token"));
    const result = await token.GetAllowance.call(params);
    return result.allowance || 0;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

async function getVirtualAddress(aelf, proposalId) {
  try {
    const referendum = await getContract(
      aelf,
      getContractAddress("Referendum")
    );
    return referendum.GetProposalVirtualAddress.call(proposalId);
  } catch (e) {
    toast.error(`failed to get virtual address of proposal ${proposalId}`);
    throw e;
  }
}

async function getProposalAllowanceInfo(aelf, proposalId, owner, symbol) {
  const [spender, decimals] = await Promise.all([
    getVirtualAddress(aelf, proposalId),
    getTokenDecimal(aelf, symbol),
  ]);
  const [allowance, balance] = await Promise.all([
    getAllowance(aelf, {
      spender,
      symbol,
      owner,
    }),
    getBalance(aelf, symbol, owner),
  ]);
  return {
    spender,
    allowance: new Decimal(allowance).dividedBy(`1e${decimals}`).toNumber(),
    decimals,
    balance: new Decimal(balance).dividedBy(`1e${decimals}`).toNumber(),
  };
}

function getOkProps(loadings, allowanceInfo, inputToken) {
  return {
    loading: loadings.actionLoading || loadings.tokenLoading,
    disabled:
      loadings.tokenLoading ||
      +allowanceInfo.allowance === 0 ||
      inputToken - allowanceInfo.allowance !== 0,
  };
}

const ApproveTokenModal = (props) => {
  const {
    action,
    aelf,
    onCancel,
    onConfirm,
    visible,
    tokenSymbol,
    proposalId,
    owner,
  } = props;
  const form = useForm({
    defaultValues: {
      amount: 0,
    },
    mode: "onChange",
  });
  const {
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
    trigger,
  } = form;
  const [allowanceInfo, setAllowanceInfo] = useState({
    decimals: 8,
    allowance: 0,
    balance: 0,
    spender: "",
  });
  const { isPhone } = useLandingPageResponsive();
  const [inputToken, setInputToken] = useState(0);
  const [loadings, setLoadings] = useState({
    tokenLoading: true,
    actionLoading: true,
  });

  const okProps = useMemo(
    () => getOkProps(loadings, allowanceInfo, inputToken),
    [loadings, allowanceInfo, inputToken]
  );
  const amount = watch("amount");

  const { callSendMethod } = useConnectWallet();

  useEffect(() => {
    if (visible) {
      getProposalAllowanceInfo(aelf, proposalId, owner, tokenSymbol)
        .then((res) => {
          setLoadings({
            tokenLoading: false,
            actionLoading: false,
          });
          setAllowanceInfo(res);
          setValue("amount", res.allowance);
          setInputToken(res.allowance);
        })
        .catch((err) => {
          setLoadings({
            tokenLoading: false,
            actionLoading: false,
          });
          console.error(err);
          toast.error(err.message || "Network Error");
        });
    }
  }, [visible, tokenSymbol, proposalId, owner]);

  function handleCancel() {
    onCancel();
  }

  async function handleOk() {
    setLoadings({
      ...loadings,
      actionLoading: true,
    });
    onConfirm(action);
  }

  async function handleStake() {
    const isValid = await trigger();
    if (!isValid) {
      return;
    }
    try {
      const results = await getValues();
      let { amount } = results;
      const { spender, decimals } = allowanceInfo;
      amount = new Decimal(amount - allowanceInfo.allowance)
        .mul(`1e${decimals}`)
        .toString();
      setLoadings({
        tokenLoading: true,
        actionLoading: false,
      });
      const method = amount > 0 ? "Approve" : "UnApprove";
      amount = Math.abs(amount);
      const result = await sendTransactionWith(
        callSendMethod,
        getContractAddress("Token"),
        method,
        {
          spender,
          amount,
          symbol: tokenSymbol,
        }
      );
      if (!result) {
        // user cancel
        setLoadings({
          actionLoading: false,
          tokenLoading: false,
        });
        return;
      }
      const txId = result.TransactionId || result.result.TransactionId;
      const txResult = await getTxResult(aelf, txId, 0, 6000);
      toast.info(`Transactions ${txId} is ${txResult.Status}`);
      getProposalAllowanceInfo(aelf, proposalId, owner, tokenSymbol)
        .then((res) => {
          setAllowanceInfo(res);
          setLoadings({
            actionLoading: false,
            tokenLoading: false,
          });
          form.setFieldsValue({
            amount: res.allowance,
          });
          setInputToken(res.allowance);
        })
        .catch((err) => {
          toast.error(err.message || "Network Error");
        });
    } catch (e) {
      setLoadings({
        actionLoading: false,
        tokenLoading: false,
      });
      console.error(e);
      toast.error(e.message || "Send Transaction failed");
    }
  }

  useEffect(() => {
    setInputToken(amount);
  }, [amount]);

  return (
    <Modal
      title={action}
      rootClassName="w-[calc(100vw-40px)] md:!w-[740px] max-w-[740px] px-[38px] py-[30px]"
      isVisible={visible}
      onClose={handleCancel}
    >
      <form className="pt-[60px]">
        <FormItem label="Token Balance:" className="!mb-[30px]" layout="horizontal">
          <div className="flex items-center gap-2">
            <span className="font-Montserrat text-desc12 text-white">{allowanceInfo.balance} {tokenSymbol}</span>
          </div>
        </FormItem>
        <FormItem label="Staked Token" layout={isPhone ? "vertical" : "horizontal"} errorText={errors.amount?.message}>
          <Controller
            control={control}
            name="amount"
            rules={{
              required: "Please input the amount",
              validate: {
                validator(value) {
                  console.log(value);
                  if (Number(value) < 0) {
                    return "Amount must be larger than 0";
                  }
                  return true;
                },
              },
            }}
            render={({ field }) => (
              <div className="flex items-center gap-2 flex-grow">
                <Input {...field} type="number" placeholder="0.0000" precision={allowanceInfo.decimals} step={1} min={0} onChange={field.onChange}    />
                <Button
                  type="primary"
                  className="!px-[30px]"
                  loading={loadings.tokenLoading}
                  disabled={
                    allowanceInfo.balance === 0 ||
                    inputToken - allowanceInfo.allowance === 0
                  }
                  onClick={handleStake}
                >
                  Stake
                </Button>
              </div>
            )}
          />
        </FormItem>
      </form>
      <div className="flex items-center justify-end gap-2">
        <Button type="primary" className="flex-1" onClick={handleStake}>Cancel</Button>
        <Button type="default" className="flex-1" {...okProps} onClick={handleOk}>{action}</Button>
      </div>
    </Modal>
  );
};

ApproveTokenModal.propTypes = {
  action: PropTypes.oneOf(Object.values(proposalActions)).isRequired,
  aelf: PropTypes.shape({
    // eslint-disable-next-line react/forbid-prop-types
    chain: PropTypes.object,
  }).isRequired,
  tokenSymbol: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  wallet: PropTypes.shape({
    invoke: PropTypes.func,
  }).isRequired,
  owner: PropTypes.string.isRequired,
  proposalId: PropTypes.string.isRequired,
};

export default ApproveTokenModal;
