'use client';
// eslint-disable-next-line no-use-before-define
import React, { useCallback, useState } from "react";
import AElf from "aelf-sdk";
import Result from "components/Result";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { ResultModal, eventBus } from 'utils/myEvent';
import { CommonOperationResultModalType } from 'components/CommonOperationResultModal';
import { okButtonConfig, INIT_RESULT_MODAL_CONFIG } from 'components/ResultModal';
import { ReactComponent as WarningFilled } from 'assets/icons/warning-filled.svg';
import Editor from '@monaco-editor/react';
import {
  omitString
} from "@common/utils";
import {
  formatTimeToNano,
  getContractAddress,
  getTxResult,
  uint8ToBase64,
} from "@redux/common/utils";
import debounce from "lodash.debounce";
import getChainIdQuery from 'utils/url';
import { did } from "@portkey/did-ui-react";
import NormalProposal from "./NormalProposal/index.jsx";
import ContractProposal, { contractMethodType } from "./ContractProposal/index.jsx";
import {
  useCallbackAssem,
  useCallGetMethod,
  useReleaseApprovedContractAction,
  useReleaseCodeCheckedContractAction,
} from "./utils.callback.jsx";
import ContractProposalModal from "./ContractProposalModal/index.jsx";
import "./index.css";
import CopylistItem from "../_proposal_root/components/CopylistItem/index.jsx";
import {
  addContractName,
  getTransactionResult,
  updateContractName,
} from "./utils.js";
import WithoutApprovalModal from "../_proposal_root/components/WithoutApprovalModal/index";
import { deserializeLog, isPhoneCheck } from "@common/utils";
import { interval } from "@utils/timeUtils";
import { useSearchParams } from 'next/navigation'
import { getAddress, fetchContractName } from 'api/request';
import {
  base64ToByteArray,
  byteArrayToHexString,
  hexStringToByteArray,
} from "@utils/formater";
import AddressNameVer from "../_proposal_root/components/AddressNameVer/index";
import {
  onlyOkModal,
} from "@components/SimpleModal/index.tsx";
import { mainExplorer, explorer, NetworkDaoHomePathName } from 'config';
import useNetworkDaoRouter from "hooks/useNetworkDaoRouter";
import { useChainSelect } from "hooks/useChainSelect";
import { useConnectWallet } from "@aelf-web-login/wallet-adapter-react";
import Tabs from 'components/Tabs';
import Modal from 'components/Modal';
import Tooltip from 'components/Tooltip';
import Button from 'components/Button';
import ConfirmModal from 'components/ConfirmModal';
import { toast } from "react-toastify";


const initApplyModal = {
  visible: false,
  title: "",
  children: "",
};

// 10 minutes
const GET_CONTRACT_VERSION_TIMEOUT = 1000 * 60 * 10;

const getProposalTypeText = {
  1: 'Parliament',
  2: 'Association',
  3: 'Referendum'
}

const CreateProposal = () => {
  // const { orgAddress = "" } = useSearchParams();
  const { isSideChain } = useChainSelect()
  const router = useNetworkDaoRouter()
  const searchParams = useSearchParams()
  const orgAddress = searchParams.get('orgAddress');
  const modifyData = useSelector((state) => state.proposalModify);
  const common = useSelector((state) => state.common);
  const [normalResult, setNormalResult] = useState({
    isModalVisible: false,
    confirming: false,
  });
  const { contractSend } = useCallbackAssem();
  const { callGetMethodSend } = useCallGetMethod();
  const releaseApprovedContractHandler = useReleaseApprovedContractAction();
  const releaseCodeCheckedContractHandler =
    useReleaseCodeCheckedContractAction();
  const [contractResult, setContractResult] = useState({
    confirming: false,
  });
  const { aelf, wallet, currentWallet } = common;
  const [applyModal, setApplyModal] = useState(initApplyModal);
  const [withoutApprovalProps, setWithoutApprovalProps] = useState({});
  const [withoutApprovalOpen, setWithoutApprovalOpen] = useState(false);
  const [activeKey, setActiveKey] = useState('normal');

  const { walletInfo: webLoginWallet, callSendMethod: callContract } = useConnectWallet();

  // open without approval modal
  const onOpenWithoutApprovalModal = (params) => {
    setWithoutApprovalProps(params);
    setWithoutApprovalOpen(true);
  };
  const handleCancel = () => {
    if (normalResult.isModalVisible) {
      setNormalResult({
        ...normalResult,
        isModalVisible: false,
        confirming: false,
      });
    }
    if (contractResult.isModalVisible) {
      setContractResult({
        ...contractResult,
        confirming: false,
      });
    }
  };

  // Ordinary Proposal
  function handleNormalSubmit(results) {
    setNormalResult({
      ...normalResult,
      ...results,
      isModalVisible: true,
      confirming: false,
    });
  }

  const ReleaseApprovedContractAction =  async (contract) => {
    const modalContent = await releaseApprovedContractHandler(contract);
    setApplyModal(modalContent);
  }

  const ReleaseCodeCheckedContractAction = async (contract, isDeploy) => {
    const modalContent = await releaseCodeCheckedContractHandler(
      contract,
      isDeploy
    );

    setApplyModal(modalContent);
  }

  const cancelWithoutApproval = () => {
    // to destroy sure modal
    setContractResult({
      confirming: false,
    });
    setWithoutApprovalOpen(false);
  };

  const ifToBeRelease = async (log) => {
    const startTime = new Date().getTime();
    let proposalId = "";
    if (log.length) {
      const result = await deserializeLog(log[0], log[0].Name, log[0].Address);
      proposalId = result.proposalId;
    }
    // start training in rotation 3s once
    // get proposal info
    return new Promise((resolve) => {
      try {
        const intervalInstance = interval(async () => {
          const endTIme = new Date().getTime();
          const proposalInfo = await callGetMethodSend(
            "Parliament",
            "GetProposal",
            {
              value: hexStringToByteArray(proposalId),
            }
          );

          if (proposalInfo === null || !!proposalInfo.toBeRelease) {
            intervalInstance.clear();
            resolve(true);
          }
          if (
            endTIme > proposalInfo?.expiredTime ||
            endTIme - startTime > GET_CONTRACT_VERSION_TIMEOUT
          ) {
            if (+proposalInfo?.approvalCount <= 0) {
              intervalInstance.clear();
              resolve("acs12 etc fail");
            } else {
              intervalInstance.clear();
              resolve(true);
            }
          }
        }, 3000);
      } catch (e) {
        interval.clear();
        toast.error(e);
      }
    });
  };
  const openFailedWithoutApprovalModal = (isUpdate, transactionId, status) => {
    // exec fail modal
    onOpenWithoutApprovalModal({
      isUpdate,
      status: {
        verification: 1,
        execution: 3,
      },
      cancel: cancelWithoutApproval,
      title: `Contract deployment failed!`,
      message: (
        <div>
          status: {status}
          <div>
            1. The contract code you deployed didn&apos;t pass the codecheck,
            possibly due to that it didn&apos;t implement methods in the ACS12
            contract, etc.
          </div>
          <div>
            2. Method fee and size fee payment failed due to insufficient
            balance.
          </div>
        </div>
      ),
      transactionId,
    });
  };
  // eslint-disable-next-line consistent-return
  const minedStatusWithoutApproval = async (name, txRes, isUpdate, address) => {
    try {
      const { Logs = [], TransactionId, codeHash } = txRes;
      const log = (Logs || []).filter((v) => v.Name === "ProposalCreated");
      const releaseRes = await ifToBeRelease(log, isUpdate, TransactionId);
      if (releaseRes === "acs12 etc fail") {
        openFailedWithoutApprovalModal(isUpdate, TransactionId);
        return Promise.reject(new Error("acs12 etc fail"));
      }
      // executing
      onOpenWithoutApprovalModal({
        isUpdate,
        status: {
          verification: 0,
          execution: 2,
        },
        cancel: cancelWithoutApproval,
      });
      if (isUpdate) {
        // already know contract address
        // get contractVersion
        const { contractVersion } = await callGetMethodSend(
          "Genesis",
          "GetContractInfo",
          address
        );
        const res = await fetchContractName({
          chainId: getChainIdQuery()?.chainId || 'AELF',
          address: getAddress(address)
        }, isSideChain);
        const contractName = res?.data?.contractName;
        return {
          status: "success",
          contractAddress: address,
          contractName,
          contractVersion,
        };
      }
      const startTime = new Date().getTime();
      return new Promise((resolve) => {
        try {
          const intervalInstance = interval(async () => {
            const endTIme = new Date().getTime();
            // timeout
            if (endTIme - startTime > GET_CONTRACT_VERSION_TIMEOUT) {
              intervalInstance.clear();
              resolve({
                status: "fail",
              });
            } else {
              // get contract address
              const contractRegistration = await callGetMethodSend(
                "Genesis",
                "GetSmartContractRegistrationByCodeHash",
                {
                  value: hexStringToByteArray(codeHash),
                }
              );
              try {
                if (contractRegistration.contractAddress) {
                  // get contractVersion
                  const { contractAddress, contractVersion } =
                    contractRegistration;
                  // get contractName
                  const res = await fetchContractName({
                    chainId: getChainIdQuery()?.chainId || 'AELF',
                    address: getAddress(contractAddress)
                  }, isSideChain);
                  const contractName = res?.data?.contractName;
                  intervalInstance.clear();
                  resolve({
                    status: "success",
                    contractAddress,
                    contractName: contractName || name || "-1",
                    contractVersion,
                  });
                }
              } catch (e) {
                intervalInstance.clear();
                toast.error(e.message);
              }
            }
          }, 10000);
        } catch (e) {
          interval.clear();
          toast.error(e.message);
        }
      });
    } catch (e) {
      toast.error(e.message);
    }
  };

  async function submitContract(contract) {
    const {
      isUpdate,
      address,
      action,
      name,
      file,
      isOnlyUpdateName,
      onSuccess,
      contractMethod,
      approvalMode,
    } = contract;
    console.log('contract', contract);
    let params = {};
    try {
      // bp and without approval, both process is below when onlyUpdateName.
      if (isOnlyUpdateName) {
        let caHash = "";
        if (currentWallet.portkeyInfo || currentWallet.discoverInfo) {
          // TODO: seems useless
          // did.setConfig({
          //   graphQLUrl: getConfig().portkey.graphQLUrl,
          // });
          const holderInfo = await did.didGraphQL.getHolderInfoByManager({
            caAddresses: [currentWallet.address],
          });
          if (
            !holderInfo ||
            !holderInfo.caHolderManagerInfo ||
            !holderInfo.caHolderManagerInfo.length
          ) {
            toast.error("Can't query holder info");
            return;
          }
          caHash = holderInfo.caHolderManagerInfo[0].caHash;
        }
        await updateContractName(currentWallet, {
          chainId: currentWallet?.chainId || 'AELF',
          operateChainId: getChainIdQuery()?.chainId || 'AELF',
          action: "UPDATE",
          contractAddress: address,
          contractName: name,
          address: currentWallet.address,
          caHash,
        });
        toast.success("Contract Name has been updated！");
        return;
      }
      switch (contractMethod) {
        case contractMethodType.ReleaseApprovedContract:
          await ReleaseApprovedContractAction(contract);
          return;
        case contractMethodType.ReleaseCodeCheckedContract:
          await ReleaseCodeCheckedContractAction(
            contract,
            action === "ProposeNewContract"
          );
          return;
        default:
          break;
      }
      if (
        action === "ProposeNewContract" ||
        action === "DeployUserSmartContract"
      ) {
        // deploy contract
        // category=0: contract is c#
        params = {
          category: "0",
          code: file,
        };
      } else {
        // update contract
        params = {
          address,
          code: file,
        };
      }
      if (approvalMode === "withoutApproval") {
        try {
          // deploying
          onOpenWithoutApprovalModal({
            isUpdate,
            status: {
              verification: 2,
              execution: 3,
            },
            cancel: cancelWithoutApproval,
          });
          // get transaction id
          const result = await contractSend(action, params);
          const byteArray = AElf.utils.sha256.array(
            base64ToByteArray(params.code)
          );
          // get codeHash from code
          const codeHash = byteArrayToHexString(byteArray);
          const txRes = await getTransactionResult(
            aelf,
            result?.TransactionId ||
              result?.result?.TransactionId ||
              result.transactionId ||
              ""
          );
          txRes.codeHash = codeHash;
          const {
            TransactionId: transactionId,
            Error: error,
            Status: status,
          } = txRes;
          // if pre-check fail
          if (status === "NODEVALIDATIONFAILED") {
            onOpenWithoutApprovalModal({
              isUpdate,
              transactionId,
              message: error,
              status: {
                verification: 1,
                execution: 3,
              },
              cancel: cancelWithoutApproval,
            });
          } else if (status === "FAILED") {
            // if balance is not enough
            openFailedWithoutApprovalModal(isUpdate, transactionId);
          } else if (status === "MINED") {
            // add contract name
            if (name && +name !== -1) {
              await addContractName(currentWallet, {
                chainId: currentWallet?.chainId || 'AELF',
                operateChainId: getChainIdQuery()?.chainId || 'AELF',
                contractName: name,
                txId: transactionId,
                action: isUpdate ? "UPDATE" : "DEPLOY",
                address: currentWallet.address,
              });
            }
            // if proposalInfo-tobeReleased is true, go to exec
            // if proposalInfo-tobeReleased is true then GetSmartContractRegistrationByCodeHash
            // start training in rotation 3s once
            //    if deploy success, can get contract address
            //    if deploy failed, if without approval modal close, open normal modal
            //    if without approval modal open, show exec failed
            // if proposalInfo-tobeReleased is false until 10min, failed deploying ACS12
            const minedRes = await minedStatusWithoutApproval(
              name,
              txRes,
              isUpdate,
              address
            );
            // todo 1.4.0
            if (minedRes.status === "success") {
              const { contractAddress, contractName, contractVersion } =
                minedRes;
              // open modal
              onOpenWithoutApprovalModal({
                isUpdate,
                status: {
                  verification: 0,
                  execution: 0,
                },
                cancel: cancelWithoutApproval,
                message: (
                  <AddressNameVer
                    address={contractAddress}
                    name={contractName}
                    ver={contractVersion}
                  />
                ),
              });
            } else {
              // exec fail modal
              onOpenWithoutApprovalModal({
                isUpdate,
                status: {
                  verification: 0,
                  execution: 1,
                },
                cancel: cancelWithoutApproval,
                message:
                  "This may be due to the failure in transaction which can be viewed via Transaction ID:",
                transactionId,
              });
            }
          }
        } catch (e) {
          console.error(e);
          toast.error(e.message);
        }
        return;
      }
      const result = await contractSend(action, params);
      const txsId =
        result?.TransactionId ||
        result?.result?.TransactionId ||
        result.transactionId ||
        "";
      if (!txsId)
        throw new Error("Transaction failed. Please reinitiate this step.");
      let Log;
      let txResult;
      if (result.data) {
        // portkey sdk login
        txResult = result.data;
      } else {
        txResult = await getTxResult(aelf, txsId ?? "");
      }
      if (txResult.Error) {
        throw new Error(txResult.Error);
      }
      if (txResult.Status === "MINED") {
        // A transaction is said to be mined when it is included to the blockchain in a new block.
        const { Logs = [] } = txResult;
        const log = (Logs || []).filter((v) => v.Name === "ProposalCreated");
        if (log.length) {
          Log = await deserializeLog(log[0], log[0].Name, log[0].Address);
        }
      }
      const { proposalId } = Log ?? "";
      if (name && +name !== -1) {
        await addContractName(currentWallet, {
          chainId: currentWallet?.chainId || 'AELF',
          operateChainId: getChainIdQuery()?.chainId || 'AELF',
          contractName: name,
          txId:
            result?.TransactionId ||
            result?.result?.TransactionId ||
            result.transactionId ||
            "",
          action: action === "ProposeNewContract" ? "DEPLOY" : "UPDATE",
          address: currentWallet.address,
        });
      }
      const chainIdQuery = getChainIdQuery();
      setApplyModal({
        visible: true,
        title: proposalId
          ? "Proposal is created！"
          : "Proposal failed to be created！",
        children: (
          <div style={{ textAlign: "left" }}>
            {proposalId ? (
              <div>
                <CopylistItem
                  label="Proposal ID"
                  value={proposalId}
                  href={`${NetworkDaoHomePathName}/proposal/${proposalId}?${chainIdQuery.chainIdQueryString}`}
                />
              </div>
            ) : (
              "This may be due to transaction failure. Please check it via Transaction ID:"
            )}
            <CopylistItem
              label="Transaction ID"
              isParentHref
              value={txsId}
              href={`${isSideChain ? explorer : mainExplorer}/tx/${txsId}`}
            />
          </div>
        ),
      });
    } catch (e) {
      console.error(e);
      toast.error(
        (e.errorMessage || {})?.message?.toString() || e.message || e.msg || "Error happened"
      );
    } finally {
      if (onSuccess) onSuccess();
      setContractResult({
        ...contract,
        confirming: false,
      });
    }
  }

  function handleContractSubmit(results) {
    setContractResult({
      ...contractResult,
      ...results,
      confirming: true,
    });
    const { isOnlyUpdateName } = results;
    const isMobile = isPhoneCheck();

    if (results.name && currentWallet.discoverInfo) {
      setContractResult((v) => ({ ...v, confirming: false }));
      handleCancel();
      onlyOkModal({
        message: `Setting contract names with the Portkey extension is currently not supported.`,
      });
      return;
    }

    ConfirmModal.confirm({
      content: (
        <>
          {isOnlyUpdateName
            ? "Are you sure you want to update this contract name?"
            : "Are you sure you want to submit this application?"}
        </>
      ),
      okText: 'Yes',
      cancelText: 'No',
      type: 'warning',
      onOk: debounce(() => submitContract(results), 500),
      onCancel: () => {
        setContractResult((v) => ({ ...v, confirming: false }));
        handleCancel();
      },
    });
  }
  // normal proposal
  async function submitNormalResult() {
    setNormalResult({
      ...normalResult,
      confirming: true,
    });
    try {
      // if (!webLoginWallet.accountInfoSync.syncCompleted) {
      //   showAccountInfoSyncingModal();
      //   return;
      // }

      const {
        expiredTime,
        contractMethodName,
        toAddress,
        proposalType,
        organizationAddress,
        proposalDescriptionUrl,
        title,
        description,
        params: { decoded },
      } = normalResult;

      const chainIdQuery = getChainIdQuery();
      const params = {
        contractAddress: getContractAddress(getProposalTypeText[proposalType]),
        methodName: "CreateProposal",
        args: {
          title,
          description,
          contractMethodName,
          toAddress,
          params: uint8ToBase64(decoded || []) || [],
          expiredTime: formatTimeToNano(expiredTime),
          organizationAddress,
          proposalDescriptionUrl,
        },
        chainId: chainIdQuery.chainId,
        // options: {
        //   chainId: chainIdQuery.chainId
        // }
      };

      const result = await callContract(params);
      // showTransactionResult(result);
      const ret =
        (result.transactionId && result) ||
        result.result ||
        result.data ||
        result;
      const txsId = ret.transactionId || ret.TransactionId;
      if (txsId) {
        eventBus.emit(ResultModal, {
          open: true,
          type: CommonOperationResultModalType.Success,
          primaryContent: 'Proposal Published',
          secondaryContent: <div>
            Transaction ID: 
            <a
              href={`${isSideChain ? explorer : mainExplorer}/tx/${txsId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tooltip title={txsId} placement="topLeft">
                {omitString(txsId)}
              </Tooltip>
            </a>
          </div>,
          footerConfig: {
            buttonList: [{
              children: (
                <Button
                  type="primary"
                  className="w-full"
                  onClick={() => {
                    router.push(`/?${chainIdQuery.chainIdQueryString}`);
                    eventBus.emit(ResultModal, INIT_RESULT_MODAL_CONFIG);
                  }}
                >
                  OK
                </Button>
              ),
            }],
          },
        });
      }
    } catch (e) {
      const errString = (e?.errorMessage || {})?.message?.Message || e.message || "Error happened"
      eventBus.emit(ResultModal, {
        open: true,
        type: CommonOperationResultModalType.Error,
        primaryContent: ' Failed to Create the proposal',
        secondaryContent: errString,
        footerConfig: {
          buttonList: [okButtonConfig],
        },
      });
    } finally {
      setNormalResult({
        ...normalResult,
        confirming: false,
        isModalVisible: false,
      });
    }
  }

  const contractModalCancle = useCallback(async () => {
    setApplyModal(initApplyModal);
  }, []);

  if (!webLoginWallet?.address) {
    return (
      <Result
        icon={<WarningFilled className="w-[74px] h-[74px]" />}
        className="h-[calc(100vh-200px)]"
        title={`Please log in first before \ncreating a proposal`}
      />
    );
  }
  return (
    <div className="bg-darkBg border border-solid border-fillBg8 rounded-[8px]">
      <Tabs
        activeKey={activeKey}
        items={[
          {
            key: 'normal',
            label: 'Ordinary Proposal',
            children: (
              <NormalProposal
                isModify={orgAddress === modifyData.orgAddress}
                {...(orgAddress === modifyData.orgAddress ? modifyData : {})}
                contractAddress={
                  orgAddress === modifyData.orgAddress
                    ? getContractAddress(getProposalTypeText[modifyData.proposalType])
                    : ""
                }
                aelf={aelf}
                wallet={wallet}
                currentWallet={currentWallet}
                submit={handleNormalSubmit}
              />
            ),
          },
          {
            key: 'contract',
            label: 'Deploy/Update Contract',
            children: (
              <ContractProposal
                loading={contractResult.confirming}
                submit={handleContractSubmit}
              />
            ),
          },
        ]}
        onChange={(key) => {
          setActiveKey(key);
        }}
      />
      <Modal
        rootClassName="md:!max-w-[740px] !w-[calc(100vw-12)] py-[22px] md:py-[30px] px-[22px] md:px-[38px]"
        title="Are you sure you want to create this new proposal?"
        width={720}
        isVisible={normalResult.isModalVisible}
        onClose={handleCancel}
      >
        <div className="flex flex-col gap-[25px] pt-[22px] mt-[30px]">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <span className="basis-1/3 text-descM13 text-lightGrey font-Montserrat text-right">Title:</span>
            <span className="basis-full sm:basis-2/3 text-desc13 text-white font-Montserrat overflow-hidden text-ellipsis whitespace-nowrap">
              {normalResult.title || '-'}
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <span className="basis-1/3 text-descM13 text-lightGrey font-Montserrat text-right">Description:</span>
            <span className="basis-2/3 text-desc13 text-white font-Montserrat overflow-hidden text-ellipsis whitespace-nowrap">
              {normalResult.description || '-'}
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <span className="basis-1/3 text-descM13 text-lightGrey font-Montserrat text-right">Proposal Type:</span>
            <span className="basis-2/3 text-desc13 text-white font-Montserrat overflow-hidden text-ellipsis whitespace-nowrap">
              {normalResult.proposalType || '-'}
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <span className="basis-1/3 text-descM13 text-lightGrey font-Montserrat text-right">Organisation Address:</span>
            <span className="w-full md:w-2/3 md:basis-2/3 text-desc13 text-white font-Montserrat overflow-hidden text-ellipsis whitespace-nowrap">
              {normalResult.organizationAddress || '-'}
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <span className="basis-1/3 text-descM13 text-lightGrey font-Montserrat text-right">Contract Address:</span>
            <span className="w-full md:w-2/3 md:basis-2/3 text-desc13 text-white font-Montserrat overflow-hidden text-ellipsis whitespace-nowrap">
              {normalResult.toAddress}
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <span className="basis-1/3 text-descM13 text-lightGrey font-Montserrat text-right">Contract Method:</span>
            <span className="w-full md:w-2/3 md:basis-2/3 text-desc13 text-white font-Montserrat overflow-hidden text-ellipsis whitespace-nowrap">
              {normalResult.contractMethodName}
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-start gap-2">
            <span className="basis-1/3 text-descM13 text-lightGrey font-Montserrat text-right">Contract Params:</span>
            <div className="w-full md:w-2/3 md:basis-2/3 h-[120px] py-[13px] border border-solid border-fillBg8 rounded-[8px]">
              <Editor
                value={JSON.stringify((normalResult.params || {}).origin, null, 2)}
                language="json"
                theme="vs-dark"
                className="proposal-custom-action-params-editor"
                options={{
                  minimap: {
                    enabled: false,
                  },
                  fontSize: 14,
                  codeLensFontSize: 14,
                  readOnly: true,
                }}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <span className="basis-1/3 text-descM13 text-lightGrey font-Montserrat text-right">Description URL:</span>
            <a
              href={normalResult.proposalDescriptionUrl}
              className="basis-2/3 text-desc13 text-secondaryMainColor font-Montserrat overflow-hidden text-ellipsis whitespace-nowrap"
              target="_blank"
              rel="noopener noreferrer"
            >
              {normalResult.proposalDescriptionUrl}
            </a>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <span className="basis-1/3 text-descM13 text-lightGrey font-Montserrat text-right">Expiration Time:</span>
            <span className="basis-2/3 text-desc13 text-white font-Montserrat">
              {normalResult.expiredTime &&
                dayjs(normalResult.expiredTime).format("YYYY/MM/DD HH:mm:ss")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="default" className="flex-1 !text-white !border-white" onClick={handleCancel}>Cancel</Button>
            <Button type="primary" className="flex-1" loading={normalResult.confirming} onClick={submitNormalResult}>OK</Button>
          </div>
        </div>
      </Modal>
      <ContractProposalModal
        contractModalCancle={contractModalCancle}
        applyModal={applyModal}
      />
      <WithoutApprovalModal
        open={withoutApprovalOpen}
        withoutApprovalProps={withoutApprovalProps}
      />
    </div>
  );
};

export default CreateProposal;
