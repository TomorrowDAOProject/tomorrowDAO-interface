/**
 * @file contract proposal
 * @author atom-yang
 */
// eslint-disable-next-line no-use-before-define
import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Radio,
  Input,
  Upload,
  Select,
  Tooltip,
  Form,
} from "antd";
import Button from "components/Button";
import { onlyOkModal } from "@components/SimpleModal/index.tsx";
import { useDispatch, useSelector } from "react-redux";
import { API_PATH } from "@redux/common/constants";
import {
  destorySelectList,
  getProposalSelectListWrap,
} from "@redux/actions/proposalSelectList";
import { getContractAddress } from "@redux/common/utils";
import { request } from "@common/request";
import { apiServer } from 'api/axios';
import { deduplicateByKey } from "../../_src/utils";
import ProposalSearch from "../../_proposal_root/components/ProposalSearch";
import { useCallGetMethod } from "../utils.callback";
import { CHAIN_ID } from "../../_src/constants";
import "./index.css";
import { toast } from "react-toastify";
import getChainIdQuery from 'utils/url';
import sortContracts from '../../_src/utils/sortContracts';

const FormItem = Form.Item;
const InputNameReg = /^[.,a-zA-Z\d]+$/;

const UpdateType = {
  updateContractName: "updateContractName",
  updateFile: "updateFile",
};
// eslint-disable-next-line max-len
const step1 =
  "1 - ProposeNewContract: Apply to deploy a new contract (proceeds to the next stage after receiving approval from the parliament);";
// eslint-disable-next-line max-len
const step2 =
  "2 - ReleaseApprovalContract: Apply for code check after the contract deployment proposal is approved (the parliament will agree upon the proposal once BPs have completed code check);";
const step3 =
  "3 - ReleaseCodeCheckedContract: Contract deployment will be executed once it passes the code check.";

export const contractMethodType = {
  ProposeNewContract: "ProposeNewContract",
  ReleaseApprovedContract: "ReleaseApprovedContract",
  ReleaseCodeCheckedContract: "ReleaseCodeCheckedContract",
};

const approvalModeList = [
  {
    modeTitle: "Without Approval",
    modeType: "withoutApproval",
  },
  {
    modeTitle: "BP Approval",
    modeType: "bpApproval",
  },
];
const contractMethodList = [
  {
    methodTitle: "Propose New Contract",
    methodUpdatedTitle: "Propose Updated Contract",
    methodType: contractMethodType.ProposeNewContract,
  },
  {
    methodTitle: "Release Approved Contract",
    methodType: contractMethodType.ReleaseApprovedContract,
  },
  {
    methodTitle: "Release Code Checked Contract",
    methodType: contractMethodType.ReleaseCodeCheckedContract,
  },
];
const noticeDeployList = [
  "Method fee: 50,000 ELF for deploying contract on the MainChain.",
  "Size fee: A certain amount of ELF for deploying contract.",
  "If the transaction pre-validation fails, fees will not be charged.",
  "If the deployment fails, fees charged will not be returned.",
];
const noticeUpdateList = [
  "Method fee: 50,000 ELF for updating contract on the MainChain.",
  "Size fee: A certain amount of ELF for updating contract.",
  "If the transaction pre-validation fails, fees will not be charged.",
  "If the update fails, fees charged will not be returned.",
];


async function checkContractName(
  value,
  isUpdate,
  currentContractInfo,
  isUpdateName
) {
  if (!value) {
    if (isUpdateName && isUpdate)
      throw new Error("Please enter the contract name！");
    return;
  }
  if (+value === -1) {
    throw new Error("-1 is not valid");
  }
  if (isUpdate && value === currentContractInfo.contractName) {
    if (isUpdateName) {
      throw new Error("The name already exists！");
    } else {
      return;
    }
  }
  if (!InputNameReg.test(value)) {
    throw new Error("Please enter alphanumeric characters only！");
  }
  if (value.length > 150) {
    throw new Error("The maximum input character is 150");
  }

  const result = await apiServer.get(
    API_PATH.CHECK_CONTRACT_NAME,
    {
      chainId: CHAIN_ID,
      contractName: value,
    },
    { method: "GET" }
  );
  const { isExist = true } = result?.data;
  if (!isExist) {
    // eslint-disable-next-line consistent-return
    return true;
  }
  throw new Error("The name already exists！");
}

async function validateFile(rule, value) {
  if (!value || Array.isArray(value) || value.length === 0) {
    return;
  }
  const file = value[0];
  const { size } = file;
  if (size > 0 && size <= 2 * 1024 * 1024) {
    return;
  }
  throw new Error("DLL file is larger than 2MB");
}

function readFile(file) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const result = reader.result.split("base64,");
      if (result.length < 2) {
        reject(new Error("file has no content"));
      } else {
        resolve(result[1]);
      }
    };
    setTimeout(() => {
      reject(new Error("file is too large to read"));
    }, 10 * 1000);
  });
}

const ContractProposal = (props) => {
  const { loading, submit } = props;
  const [disabled, setDisabled] = useState(false);
  const [form] = Form.useForm();
  const proposalSelect = useSelector((state) => state.proposalSelect);
  const common = useSelector((state) => state.common);
  const { currentWallet } = common;
  const dispatch = useDispatch();
  const { validateFields, setFieldsValue, getFieldValue } = form;
  const [fileLength, setFileLength] = useState(0);
  const [currentContractInfo, setCurrentContractInfo] = useState({
    address: "",
    isSystemContract: false,
    contractName: -1,
  });
  const [contractList, setContractList] = useState([]);
  const [checkName, setCheckName] = useState(undefined);
  const [contractMethod, setContractMethod] = useState(
    contractMethodType.ProposeNewContract
  );
  const [approvalMode, setApprovalMode] = useState("withoutApproval");
  const [update, setUpdate] = useState();
  const { callGetMethodSend } = useCallGetMethod();
  const chain = getChainIdQuery();

  useEffect(() => {
    request(
      API_PATH.GET_ALL_CONTRACTS,
      {
        search: "",
        chainId: chain?.chainId,
        skipCount: 0,
        maxResultCount: 1000,
      },
      { method: "GET" }
    )
      .then((res) => {
        setContractList(sortContracts(res.list) || []);
      })
      .catch((e) => {
        toast.error(e.message || "Network Error");
      });
  }, [update]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isUpdateName, setUpdateName] = useState(false);

  const noticeList = useMemo(() => {
    let list = isUpdate ? noticeUpdateList : noticeDeployList;
    if (CHAIN_ID !== "AELF") {
      list = list.slice(1);
    }
    return list;
  }, [isUpdate, CHAIN_ID]);

  const setContractName = useCallback((name) => {
    setFieldsValue({
      name,
    });
    setCheckName(undefined);
  }, []);
  function handleAction() {
    setContractName("");
    setIsUpdate(!isUpdate);
  }
  const contractFilter = (input) =>
    contractList.filter(
      ({ contractName, address }) =>
        contractName.indexOf(input) > -1 || address.indexOf(input) > -1
    ).length > 0;

  function normFile(e) {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  function handleUpload(e) {
    setFileLength(e.fileList.length);
  }

  const checkContractNameHandler = useCallback(
    async (name) => {
      setCheckName({
        validateStatus: "validating",
        errorMsg: undefined, // Inquiring...
      });
      try {
        await checkContractName(
          name,
          isUpdate,
          currentContractInfo,
          isUpdateName
        );
        setCheckName({
          validateStatus: "success",
          errorMsg: undefined, // Inquiring...
        });
      } catch (e) {
        setCheckName({
          validateStatus: "error",
          errorMsg: e.message,
        });
        throw e;
      }
    },
    [isUpdate, currentContractInfo, isUpdateName]
  );

  async function customValidateFields() {
    const [result] = await Promise.all([
      validateFields(),
      checkContractNameHandler(getFieldValue("name")),
    ]);
    console.log(result);
    return result;
  }

  const isInWhiteList = async (author) => {
    if (CHAIN_ID !== "AELF") {
      const list = await callGetMethodSend(
        "Parliament",
        "GetProposerWhiteList",
        ""
      );
      // in white list
      if (list?.proposers.find((ele) => ele === author)) {
        return false;
      }
    }
    return true;
  };

  const checkUpdateMode = async (address) => {
    try {
      const result = await callGetMethodSend(
        "Genesis",
        "GetContractInfo",
        address
      );
      const { author } = result;
      // Genesis contract ---> bpApproval
      // bp mode choose withoutApproval mode
      if (
        getContractAddress("Genesis") === author &&
        approvalMode === "withoutApproval"
      ) {
        toast.error(
          "Contract update failed. Please update this contract in BP Approval mode."
        );
        return false;
      }
      // withoutApproval mode choose bp mode
      if (
        getContractAddress("Genesis") !== author &&
        (await isInWhiteList(author)) &&
        approvalMode === "bpApproval"
      ) {
        toast.error(
          "Contract update failed. Please update this contract in without Approval mode."
        );
        return false;
      }
      return true;
    } catch (e) {
      toast.error(e);
      return false;
    }
  };
  async function handleSubmit() {
    try {
      setDisabled(true);
      const result = await customValidateFields();
      // ca wallet deploy contract in AELF chain
      if (
        (currentWallet.discoverInfo || currentWallet.portkeyInfo) &&
        !currentWallet.nightElfInfo &&
        approvalMode === "withoutApproval" &&
        !isUpdate &&
        CHAIN_ID === "AELF"
      ) {
        onlyOkModal({
          message: `Smart contract wallet address currently do not support deploying contracts on the aelf MainChain without approval.`,
        });
        return;
      }
      const {
        address = "",
        // eslint-disable-next-line no-shadow
        contractMethod = "",
        proposalId,
      } = result;
      if (
        isUpdate &&
        !isUpdateName &&
        (approvalMode === "withoutApproval" ||
          contractMethod === "ProposeNewContract") &&
        !(await checkUpdateMode(address))
      ) {
        return;
      }
      let file;
      if (result.file) {
        file = await readFile(result.file[0].originFileObj);
      }
      let name = result.name || "";
      if (isUpdate && currentContractInfo.contractName === name) {
        name = "";
      }
      let action = "";
      if (approvalMode === "withoutApproval") {
        action = isUpdate
          ? "UpdateUserSmartContract"
          : "DeployUserSmartContract";
      } else {
        action = result.action;
      }
      const submitObj = {
        approvalMode,
        isUpdate,
        file,
        action,
        address,
        name,
        proposalId,
        isOnlyUpdateName: isUpdate && isUpdateName,
        contractMethod,
        onSuccess: () => setUpdate(Date.now()),
      };
      submit(submitObj);
    } catch (e) {
      console.error(e);
      toast.error(
        e.message ||
          e?.errorFields?.at?.(-1)?.errors?.[0] ||
          "Please input the required form!"
      );
    } finally {
      setDisabled(false);
    }
  }

  function handleContractChange(address) {
    const info = contractList.filter((v) => v.address === address)[0];
    setCurrentContractInfo(info);
    const name = +info.contractName === -1 ? "" : info.contractName;
    setContractName(name);
  }

  const updateTypeHandler = useCallback((e) => {
    setUpdateName(e.target.value === UpdateType.updateContractName);
    setFieldsValue({
      address: "",
    });
    setContractName("");
  }, []);

  const methosTip = useMemo(
    () => (
      <>
        <p>Contract deployment follows 3-step directions:</p>
        <p>{step1}</p>
        <p>{step2}</p>
        <p>{step3}</p>
      </>
    ),
    []
  );

  useEffect(() => {
    getProposalSelectListWrap(dispatch, {
      ...proposalSelect.params,
      address: currentWallet?.address,
    });
    return () => {
      destorySelectList();
    };
  }, [currentWallet]);

  const updateTypeFormItem = () => {
    return (
      <FormItem label="" name="updateType">
        <Radio.Group onChange={updateTypeHandler} buttonStyle="solid">
          <Radio.Button
            value={UpdateType.updateFile}
          >
            Update Contract File
          </Radio.Button>
          <Radio.Button value={UpdateType.updateContractName}>
            Update The Contract Name Only
          </Radio.Button>
        </Radio.Group>
      </FormItem>
    );
  };

  const approvalModeFormItem = () => {
    return (
      <FormItem
        label={<span>Approval Mode</span>}
        name="approvalMode"
        rules={[
          {
            required: true,
            message: "Please select a approval mode!",
          },
        ]}
      >
        <Select showSearch optionFilterProp="children">
          {approvalModeList.map((v) => (
            <Select.Option key={v.modeType} value={v.modeType}>
              {v.modeTitle}
            </Select.Option>
          ))}
        </Select>
      </FormItem>
    );
  };

  const contractMethodFormItem = () => {
    return (
      <FormItem
        label={
          <span>
            Contract Method
            <Tooltip title={methosTip}>
              <i className="tmrwdao-icon-information text-[20px] text-lightGrey ml-2 align-bottom" />
            </Tooltip>
          </span>
        }
        name="contractMethod"
        rules={[
          {
            required: true,
            message: "Please select a contract method!",
          },
        ]}
      >
        <Select showSearch optionFilterProp="children">
          {contractMethodList.map((v) => (
            <Select.Option key={v.methodType} value={v.methodType}>
              {isUpdate
                ? v?.methodUpdatedTitle || v.methodTitle
                : v.methodTitle}
            </Select.Option>
          ))}
        </Select>
      </FormItem>
    );
  };

  const contractAddressFormItem = () => {
    let list =
      approvalMode === "withoutApproval"
        ? contractList.filter((ele) => !ele.isSystemContract)
        : contractList;
    // deduplicate by address
    list = deduplicateByKey(list, 'address');
    return (
      <FormItem
        label="Contract Address"
        name="address"
        rules={[
          {
            required: true,
            message: "Please select a contract address!",
          },
        ]}
      >
        <Select
          placeholder="Please select a contract address"
          showSearch
          optionFilterProp="children"
          filterOption={contractFilter}
          onChange={handleContractChange}
        >
          {list.map((v) => (
            <Select.Option key={v.address} value={v.address}>
              {v.contractName || v.address}
            </Select.Option>
          ))}
        </Select>
      </FormItem>
    );
  };
  const contractNameFormItem = () => {
    return (
      <FormItem
        label="Contract Name"
        name="name"
        required={isUpdate && isUpdateName}
        validateStatus={checkName?.validateStatus}
        help={checkName?.errorMsg}
      >
        <Input
          disabled={isUpdate && currentContractInfo.isSystemContract}
          maxLength={150}
        />
      </FormItem>
    );
  };
  const uploadFileFormItem = () => {
    return (
      <FormItem
        className="upload-file-form-item"
        required
        label={
          <span>
            Upload File
            <Tooltip
              title="When creating a 'Contract Deployment' proposal, you only need to upload the file, more information can be viewed on the public proposal page after the application is successful"
            >
              <i className="tmrwdao-icon-information text-[20px] text-lightGrey ml-2 align-bottom" />
            </Tooltip>
          </span>
        }
      >
        <FormItem
          name="file"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[
            {
              required: true,
              message: "Please upload the DLL or PATCHED file!",
            },
            {
              validator: validateFile,
            },
          ]}
        >
          <Upload
            accept=".dll,.patched"
            beforeUpload={() => false}
            onChange={handleUpload}
            extra="Support DLL or PATCHED file, less than 2MB"
            // if upload is disabled, avoid being triggered by label
          >
            <Button type="primary" size="small" disabled={fileLength === 1}>
              <i className="tmrwdao-icon-upload-document text-[20px] text-inherit mr-[6px]" />
              Click to Upload
            </Button>
          </Upload>
        </FormItem>
      </FormItem>
    );
  };

  return (
    <div className="contract-proposal">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          approvalMode: "withoutApproval",
          action: "ProposeNewContract",
          address: "",
          updateType: UpdateType.updateFile,
          contractMethod: contractMethodType.ProposeNewContract,
          name:
            +currentContractInfo.contractName === -1
              ? ""
              : currentContractInfo.contractName,
        }}
        onValuesChange={(change) => {
          if ("approvalMode" in change) {
            setApprovalMode(change.approvalMode);
            setFieldsValue({
              address: "",
              name: "",
              proposalId: "",
            });
          }
          if ("name" in change) setCheckName(undefined);
          if ("contractMethod" in change) {
            setContractMethod(change.contractMethod);
            setFieldsValue({
              address: "",
              name: "",
              proposalId: "",
            });
          }
          // if ('proposalId' in change) proposalIdChange(change.proposalId);
          if ("updateType" in change || "action" in change) {
            setFieldsValue({
              contractMethod: contractMethodType.ProposeNewContract,
              proposalId: "",
            });
            setContractMethod(contractMethodType.ProposeNewContract);
          }
        }}
      >
        <FormItem label="Contract Action" name="action">
          <Radio.Group onChange={handleAction}>
            <Radio value="ProposeNewContract">Deploy Contract</Radio>
            <Radio value="ProposeUpdateContract">Update Contract</Radio>
          </Radio.Group>
        </FormItem>
        {isUpdate ? updateTypeFormItem() : null}
        {!(isUpdate && isUpdateName) && approvalModeFormItem()}
        {approvalMode === "bpApproval" && !(isUpdate && isUpdateName)
          ? contractMethodFormItem()
          : null}
        {approvalMode === "withoutApproval" ||
        contractMethodType.ProposeNewContract === contractMethod ? (
          <>
            {isUpdate ? contractAddressFormItem() : null}
            {!isUpdate || (isUpdate && isUpdateName)
              ? contractNameFormItem()
              : null}
            {!(isUpdateName && isUpdate) ? uploadFileFormItem() : null}
          </>
        ) : (
          <ProposalSearch selectMehtod={contractMethod} />
        )}
        {approvalMode === "withoutApproval" && (
          <Form.Item label="Notice">
            <div className="contract-proposal-notice-content">
              {noticeList.map((ele, index) => {
                return (
                  <div className="content-item">
                    <span>{index + 1}.</span>
                    <span>{ele}</span>
                  </div>
                );
              })}
            </div>
          </Form.Item>
        )}
        <div className="flex justify-end border-0 border-t border-solid border-fillBg8 pt-[50px] pb-0">
          <Button
            type="primary"
            loading={loading}
            disabled={disabled}
            onClick={handleSubmit}
          >
            Apply
          </Button>
        </div>
      </Form>
    </div>
  );
};

ContractProposal.propTypes = {
  submit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ContractProposal;
