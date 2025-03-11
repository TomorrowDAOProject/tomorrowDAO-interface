"use client";
import React, { useEffect, useState, useMemo } from "react";
import AElf from "aelf-sdk";
import Decimal from "decimal.js";
import LinkNetworkDao  from "components/LinkNetworkDao";
import getChainIdQuery from 'utils/url';
import ReactIf from "react-if";
import { useSelector } from "react-redux";
import { InfoCircleOutlined } from "@ant-design/icons";
import { apiServer } from 'api/axios'
import {
  Button,
  Select,
  Tooltip,
  InputNumber,
  Input,
  Switch,
  Divider,
  Form,
  Modal,
} from "antd";
import { toast } from 'react-toastify';
import constants, { API_PATH } from "@redux/common/constants";
import {
  commonFilter,
  getContractAddress,
  showTransactionResult,
  rand16Num,
} from "@redux/common/utils";
import { getTokenList, getContract, sleep } from "@common/utils";
import "./index.css";
import { WebLoginInstance } from "@utils/webLogin";
import useNetworkDaoRouter from "hooks/useNetworkDaoRouter";


const { Switch: ConditionSwitch, Case } = ReactIf;

const { TextArea } = Input;

const { proposalTypes } = constants;

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 6 },
  },
  wrapperCol: {
    sm: { span: 8 },
  },
};

async function validateAddressList(rule, value) {
  if (value && value.length > 0) {
    const inValid = value.split(",").filter((v) => {
      try {
        AElf.utils.decodeAddressRep(v);
        return false;
      } catch (e) {
        return true;
      }
    });
    if (inValid.length !== 0) {
      throw new Error(`${inValid[0]} is not a valid address`);
    }
  }
  return true;
}

const FIELDS_MAP = {
  proposalType: {
    name: "proposalType",
    label: (
      <span>
        Proposal Mode&nbsp;
        <Tooltip
          title="There are currently three proposal models.
          After selecting one, you will need to operate according to its rules.
          For specific rules, see 'Proposal rules'"
        >
          <InfoCircleOutlined className="!text-lightGrey" />
        </Tooltip>
      </span>
    ),
    placeholder: "Please select a proposal mode",
    rules: [
      {
        required: true,
        message: "Please select a proposal mode!",
      },
    ],
  },
  minimalApprovalThreshold: {
    name: ["proposalReleaseThreshold", "minimalApprovalThreshold"],
    label: "Minimal Approval Threshold",
    placeholder: "",
    rules: [
      {
        required: true,
        message: "Please set the threshold",
      },
      {
        validator(rule, value) {
          // eslint-disable-next-line max-len
          return value > 0
            ? Promise.resolve()
            : Promise.reject(
                new Error(
                  "Minimal Approval Threshold needs to be larger than 0"
                )
              );
        },
      },
    ],
  },
  maximalRejectionThreshold: {
    name: ["proposalReleaseThreshold", "maximalRejectionThreshold"],
    label: "Maximal Rejection Threshold",
    placeholder: "",
    rules: [
      {
        required: true,
        message: "Please set the threshold",
      },
    ],
  },
  maximalAbstentionThreshold: {
    name: ["proposalReleaseThreshold", "maximalAbstentionThreshold"],
    label: "Maximal Abstention Threshold",
    placeholder: "",
    rules: [
      {
        required: true,
        message: "Please set the threshold",
      },
    ],
  },
  minimalVoteThreshold: {
    name: ["proposalReleaseThreshold", "minimalVoteThreshold"],
    label: "Minimal Vote Threshold",
    placeholder: "",
    rules: [
      {
        required: true,
        message: "Please set the threshold",
      },
    ],
  },
  tokenSymbol: {
    name: "tokenSymbol",
    label: "Token Symbol",
    placeholder: "Please select a token",
    rules: [
      {
        required: true,
        message: "Please select a token!",
      },
    ],
  },
  proposerAuthorityRequired: {
    label: (
      <span>
        Proposer Authority Required&nbsp;
        <Tooltip title="set to false to allow anyone to create a new proposal">
          <InfoCircleOutlined className="!text-lightGrey" />
        </Tooltip>
      </span>
    ),
    placeholder: "",
    rules: [
      {
        required: true,
        message: "Please set the value!",
      },
    ],
    valuePropName: "checked",
  },
  members: {
    name: "members",
    label: (
      <span>
        Organisation members&nbsp;
        <Tooltip
          title="Input the address list of members,
          separated by commas, such as
          `28Y8JA1i2cN6oHvdv7EraXJr9a1gY6D1PpJXw9QtRMRwKcBQMK,x7G7VYqqeVAH8aeAsb7gYuTQ12YS1zKuxur9YES3cUj72QMxJ`"
        >
          <InfoCircleOutlined className="!text-lightGrey" />
        </Tooltip>
      </span>
    ),
    placeholder: "Input the address list of members, separated by commas",
    rules: [
      {
        required: true,
        type: "string",
        message: 'Please input the correct members list',
      },
      ({ getFieldValue }) => ({
        validator: validateAddressList,
      }),
    ],
  },
  proposers: {
    name: "proposers",
    label: (
      <span>
        Proposer White List&nbsp;
        <Tooltip
          title="Input the address list of proposers,
          separated by commas, such as
           `28Y8JA1i2cN6oHvdv7EraXJr9a1gY6D1PpJXw9QtRMRwKcBQMK,x7G7VYqqeVAH8aeAsb7gYuTQ12YS1zKuxur9YES3cUj72QMxJ`"
        >
          <InfoCircleOutlined className="!text-lightGrey" />
        </Tooltip>
      </span>
    ),
    placeholder: "Input the address list of proposers, separated by commas",
    rules: [
      {
        required: true,
        type: "string",
        message: "Please input the correct proposers list",
      },
      ({ getFieldValue }) => ({
        validator: validateAddressList,
      }),
    ],
  },
};

function getInputPropsMap(proposalType, tokenSymbol, tokenList) {
  let tokenDecimal = (tokenList || []).filter((t) => t.symbol === tokenSymbol);
  tokenDecimal = tokenDecimal.length === 0 ? 8 : tokenDecimal[0].decimals;
  return {
    [proposalTypes.PARLIAMENT]: {
      formatter: (value) => `${value}%`,
      min: 0,
      max: 100,
      precision: 2,
    },
    [proposalTypes.ASSOCIATION]: {
      formatter: (value) => value,
      min: 0,
      precision: 0,
    },
    [proposalTypes.REFERENDUM]: {
      formatter: (value) => value,
      min: 0,
      precision: tokenDecimal,
    },
  }[proposalType];
}

const ABSTRACT_TOTAL = 100;

function getContractParams(formValue, tokenList) {
  const {
    proposalType,
    tokenSymbol,
    proposers = "",
    members = "",
    proposerAuthorityRequired = false,
    proposalReleaseThreshold,
  } = formValue;
  const proposersList = proposers.split(",").filter((v) => v);
  const membersList = members.split(",").filter((v) => v);
  switch (proposalType) {
    case proposalTypes.PARLIAMENT:
      return {
        proposalReleaseThreshold: Object.keys(proposalReleaseThreshold).reduce(
          (acc, key) => ({
            ...acc,
            [key]: proposalReleaseThreshold[key] * ABSTRACT_TOTAL,
          }),
          {}
        ),
        proposerAuthorityRequired,
        parliamentMemberProposingAllowed: true,
      };
    case proposalTypes.ASSOCIATION:
      return {
        proposalReleaseThreshold,
        organizationMemberList: {
          organizationMembers: membersList,
        },
        proposerWhiteList: {
          proposers: proposersList,
        },
      };
    case proposalTypes.REFERENDUM:
      // eslint-disable-next-line no-case-declarations
      let decimal = tokenList.filter((v) => v.symbol === tokenSymbol);
      decimal = decimal.length > 0 ? decimal[0].decimals : 8;
      return {
        proposalReleaseThreshold: Object.keys(proposalReleaseThreshold).reduce(
          (acc, key) => ({
            ...acc,
            [key]: new Decimal(proposalReleaseThreshold[key]).mul(
              `1e${decimal}`
            ),
          }),
          {}
        ),
        tokenSymbol,
        proposerWhiteList: {
          proposers: proposersList,
        },
      };
    default:
      throw new Error("why are you here");
  }
}

function getWhiteList() {
  const chainIdQuery = getChainIdQuery();
  return apiServer.get(
    API_PATH.GET_ORGANIZATIONS,
    {
      skipCount: 1,
      proposalType: proposalTypes.PARLIAMENT,
      chainId: chainIdQuery.chainId,
    }
  )
    .then((res) => {
      const { bpList = [], parliamentProposerList = [] } = res;
      return {
        bpList,
        parliamentProposerList,
      };
    })
    .catch((e) => {
      console.error(e);
      return [];
    });
}

const SELECT_OPTIONS_WITH_AUTHORITY = [
  proposalTypes.PARLIAMENT,
  proposalTypes.ASSOCIATION,
  proposalTypes.REFERENDUM,
];

const SELECT_OPTIONS_WITH_NO_AUTHORITY = [
  proposalTypes.ASSOCIATION,
  proposalTypes.REFERENDUM,
];

const FORM_INITIAL = {
  proposalType: "",
  proposerAuthorityRequired: false,
  tokenSymbol: "ELF",
};

const CreateOrganization = () => {
  const navigate = useNetworkDaoRouter();

  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const { validateFields } = form;
  const common = useSelector((state) => state.common);
  const { aelf, currentWallet } = common;
  const [tokenList, setTokenList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectOptions, setSelectOptions] = useState(
    SELECT_OPTIONS_WITH_AUTHORITY
  );
  const [formData, setFormData] = useState({
    proposalType: proposalTypes.ASSOCIATION,
  });

  const [whiteList, setWhiteList] = useState([]);
  useEffect(() => {
    getTokenList({voteValid: true}).then((tokens) => {
      setTokenList(Object.keys(tokens).map((key) => tokens[key]));
    });
    getWhiteList().then((arr) => {
      const whiteList = [...arr.bpList, ...arr.parliamentProposerList];
      setWhiteList(whiteList)
    });
  }, []);
  useEffect(() => {
    if (whiteList.indexOf(currentWallet.address) === -1) {
      setSelectOptions(SELECT_OPTIONS_WITH_NO_AUTHORITY);
    } else {
      setSelectOptions(SELECT_OPTIONS_WITH_AUTHORITY);
    }
  }, [whiteList, currentWallet.address])

  async function handleSubmit() {
    try {
      const formValue = await validateFields();
      setIsLoading(true);
      let param = getContractParams(formValue, tokenList);
      const contract = await getContract(
        aelf,
        getContractAddress(formValue.proposalType)
      );
      console.log(contract);
      const orgAddress = await contract.CalculateOrganizationAddress.call(
        param
      );
      const isOrgExist = await contract.ValidateOrganizationExist.call(
        orgAddress
      );
      if (isOrgExist) {
        param = {
          ...param,
          creationToken: rand16Num(64),
        };
      }

      if (param.proposalReleaseThreshold) {
        const thredshold = param.proposalReleaseThreshold;
        param.proposalReleaseThreshold = {}
        // eslint-disable-next-line no-restricted-syntax, guard-for-in
        for (const key in thredshold) {
          const val = thredshold[key];
          if (val instanceof Decimal) {
            param.proposalReleaseThreshold[key] = val.toString();
          } else {
            param.proposalReleaseThreshold[key] = val;
          }
        }
      }

      // if (!wallet.accountInfoSync.syncCompleted) {
      //   showAccountInfoSyncingModal();
      //   return;
      // }
      
      console.log("callContract", param);
      // maximalAbstentionThreshold   maximalRejectionThreshold  minimalApprovalThreshold minimalVoteThreshold
      const organizationMemberList = param?.organizationMemberList?.organizationMembers ?? [];
      const proposers = param?.proposerWhiteList?.proposers ?? [];
      const { maximalAbstentionThreshold, maximalRejectionThreshold, minimalApprovalThreshold, minimalVoteThreshold } = param.proposalReleaseThreshold;
      let content = '';
      if (formValue.proposalType === proposalTypes.PARLIAMENT) { 
        if (minimalApprovalThreshold > minimalVoteThreshold) {
          content = ('Minimal Approval Threshold needs to be less than or equal to the Minimal Vote Threshold.');
          
        }
        if ((minimalApprovalThreshold + maximalAbstentionThreshold) > 10000) {
          content = ('Maximal Abstention Threshold plus the Minimal Approval Threshold must be less than or equal to 100%');
          
        }
        if ((minimalApprovalThreshold + maximalRejectionThreshold) > 10000) {
          content = ('Maximal Rejection Threshold plus the Minimal Approval Threshold must be less than or equal to 100%');
          
        }
      }
      if (formValue.proposalType === proposalTypes.ASSOCIATION) { 
        if (minimalVoteThreshold > organizationMemberList.length) {
          content = ('Minimal Vote Threshold needs to be less than or equal to the Organisation members.');
          
        }
        if ((minimalApprovalThreshold > minimalVoteThreshold)) {
          content = ('Minimal Approval Threshold needs to be less than or equal to the Minimal Vote Threshold.');
          
        }
        if ((maximalAbstentionThreshold + minimalApprovalThreshold) > organizationMemberList.length) {
          content = ('Maximal Abstention Threshold plus the Minimal Approval Threshold must be less than or equal to the number of Organisation members.');
          
        }
        if ((maximalRejectionThreshold + minimalApprovalThreshold) > organizationMemberList.length) {
          content = ('Maximal Rejection Threshold plus the Minimal Approval Threshold must be less than or equal to the number of Organisation members.');
          
        }
      }
      if (formValue.proposalType === proposalTypes.REFERENDUM) {
        if (minimalApprovalThreshold > minimalVoteThreshold) {
          content = ('Minimal Approval Threshold needs to be less than or equal to the Minimal Vote Threshold.');
          
        }
      }
      if (content) {
        let modalIns = modal.info({
          wrapClassName: 'create-organization-modal',
          title: 'Organization Creation Failed',
          closable: true,
          icon: null,
          content: (
            <div>
              <p>{content}</p>
            </div>
          ),
          footer: <Button
            type="primary"
            onClick={() => { 
              modalIns.destroy();
            }}
            className="hover:!bg-darkBg hover:!text-mainColor hover:border hover:border-solid hover:border-mainColor"
          >
            Got It
          </Button>,
        });
        return;
      }
      const chainIdQuery = getChainIdQuery();
      const result = await WebLoginInstance.get().callContract({
        contractAddress: getContractAddress(formValue.proposalType),
        methodName: "CreateOrganization",
        args: param,
        chainId: chainIdQuery.chainId,
        // options: {
        //   chainId: chainIdQuery.chainId
        // }
      });
      showTransactionResult(result);
      await sleep(2000);
      
      navigate.push(`/organization?${chainIdQuery.chainIdQueryString}`);
    } catch (e) {
      console.error(e);
      const msg = (e?.errorMessage || {})?.message?.Message ||
      e.message || e?.Error?.Message
      if (msg) {
        toast.error(msg.toString());
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleProposalTypeChange(type) {
    setFormData({
      ...formData,
      proposalType: type,
    });
  }

  const INPUT_PROPS_MAP = useMemo(
    () =>
      getInputPropsMap(
        formData.proposalType || proposalTypes.PARLIAMENT,
        formData.tokenSymbol,
        tokenList
      ),
    [formData.proposalType, formData.tokenSymbol, tokenList]
  );

  return (
    <div className="create-organization page-content-bg-border !bg-darkBg">
      {contextHolder}
      <div className="create-organization-header">
        <div className="create-organization-header-title font-Montserrat">
          Create Organisation
        </div>
        <div className="create-organization-header-action">
          <div
            className="rounded-[42px] bg-mainColor flex items-center gap-[6px] cursor-pointer"
          >
            <LinkNetworkDao href="/organization" className="text-white font-Montserrat px-[10px] py-[6px] rounded-[42px] border border-solid border-mainColor hover:!bg-darkBg hover:!text-mainColor hover:border hover:border-solid hover:border-mainColor">
              Back to Organisation List
            </LinkNetworkDao>
          </div>
        </div>
      </div>
      <Divider className="bg-borderColor my-[20px]" />
      <Form form={form} initialValues={FORM_INITIAL} {...formItemLayout} className="w-full px-[40px] py-[24px] create-organization-form">
        <FormItem
          label={FIELDS_MAP.proposalType.label}
          required
          {...FIELDS_MAP.proposalType}
        >
          <Select
            placeholder={FIELDS_MAP.proposalType.placeholder}
            onChange={handleProposalTypeChange}
            className="proposalSelect"
          >
            {selectOptions.map((v) => (
              <Select.Option value={v} key={v}>
                {v}
              </Select.Option>
            ))}
          </Select>
        </FormItem>
        <ConditionSwitch>
          <Case condition={formData.proposalType === proposalTypes.PARLIAMENT}>
            <FormItem
              label={FIELDS_MAP.proposerAuthorityRequired.label}
              required
              {...FIELDS_MAP.proposerAuthorityRequired}
            >
              <Switch />
            </FormItem>
          </Case>
          <Case condition={formData.proposalType === proposalTypes.ASSOCIATION}>
            <FormItem label={FIELDS_MAP.members.label} {...FIELDS_MAP.members}>
              <TextArea placeholder={FIELDS_MAP.members.placeholder} autoSize />
            </FormItem>
          </Case>
          <Case condition={formData.proposalType === proposalTypes.REFERENDUM}>
            <FormItem
              label={FIELDS_MAP.tokenSymbol.label}
              required
              {...FIELDS_MAP.tokenSymbol}
            >
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={commonFilter}
                placeholder={FIELDS_MAP.tokenSymbol.placeholder}
              >
                {tokenList.map((v) => (
                  <Select.Option key={v.symbol} value={v.symbol}>
                    {v.symbol}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>
          </Case>
        </ConditionSwitch>
        {formData.proposalType &&
        formData.proposalType !== proposalTypes.PARLIAMENT ? (
          <FormItem
            label={FIELDS_MAP.proposers.label}
            {...FIELDS_MAP.proposers}
            required
          >
            <TextArea placeholder={FIELDS_MAP.proposers.placeholder} autoSize />
          </FormItem>
        ) : null}
        <FormItem
          label={FIELDS_MAP.minimalApprovalThreshold.label}
          required
          {...FIELDS_MAP.minimalApprovalThreshold}
        >
          <InputNumber {...INPUT_PROPS_MAP} />
        </FormItem>
        <FormItem
          label={FIELDS_MAP.maximalRejectionThreshold.label}
          required
          {...FIELDS_MAP.maximalRejectionThreshold}
        >
          <InputNumber {...INPUT_PROPS_MAP} />
        </FormItem>
        <FormItem
          label={FIELDS_MAP.maximalAbstentionThreshold.label}
          required
          {...FIELDS_MAP.maximalAbstentionThreshold}
        >
          <InputNumber {...INPUT_PROPS_MAP} />
        </FormItem>
        <FormItem
          label={FIELDS_MAP.minimalVoteThreshold.label}
          required
          {...FIELDS_MAP.minimalVoteThreshold}
        >
          <InputNumber {...INPUT_PROPS_MAP} />
        </FormItem>
        <div className="w-full text-right">
          <Button
            shape="round"
            type="primary"
            loading={isLoading}
            onClick={handleSubmit}
            className="hover:!bg-darkBg hover:!text-mainColor hover:border hover:border-solid hover:border-mainColor"
          >
            <span className="relative top-[-3px]">Apply</span>
            <i className="tmrwdao-icon-default-arrow ml-[10px]" />
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateOrganization;
