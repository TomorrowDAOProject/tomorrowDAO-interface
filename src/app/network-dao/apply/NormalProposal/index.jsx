import React, { useEffect, useState } from "react";
import Editor from '@monaco-editor/react';
import dayjs from 'dayjs';
import PropTypes from "prop-types";
import constants, { API_PATH } from "@redux/common/constants";
import {
  isInnerType,
  isSpecialParameters,
  formatTimeToNano,
  parseJSON,
  commonFilter,
  isSingleStringParameter,
  isEmptyInputType,
} from "@redux/common/utils";
import { request } from "@common/request";
import "./index.css";
import {
  validateURL,
  getContractMethodList,
  CONTRACT_INSTANCE_MAP,
} from "@common/utils";
import { useForm, Controller } from "react-hook-form";
import { combineDateAndTime } from 'utils/time';
import SimpleTimePicker from 'components/SimpleTimePicker';
import SimpleDatePicker from 'components/SimpleDatePicker';
import Input from "components/Input";
import Select from "components/Select";
import FormItem from "components/FormItem";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import TextArea from "components/Textarea";
import { toast } from "react-toastify";
import { validate } from "graphql";

const { proposalTypes } = constants;

const FIELDS_MAP = {
  title: {
    name: "title",
    label: "Title",
    placeholder: "Enter the title of the list (300 characters max)",
    rules: {
      required: "Title is required",
      maxLength: {
        value: 300,
        message: "You can only enter a maximum of 300 characters"
      }
    }
  },
  description: {
    name: "description",
    label: "Description",
    placeholder: " ",
    rules: {
      required: "Description is required",
      maxLength: {
        value: 10200,
        message:"You can only enter a maximum of 10200 characters",
      }
    },
  },
  formProposalType: {
    name: "formProposalType",
    label: (
      <span className="flex gap-2">
        Proposal Mode
        <Tooltip
          title="There are currently three proposal models.
          After selecting one, you will need to operate according to its rules.
          For specific rules, see 'Proposal rules'"
        >
          <i className="tmrwdao-icon-information text-[18px] text-lightGrey align-bottom" />
        </Tooltip>
      </span>
    ),
    rules: {
      required: "Proposal Mode is required",
    },
  },
  formOrgAddress: {
    name: "formOrgAddress",
    label: (
      <span className="flex gap-2">
        Organisation
        <Tooltip
          title="Choose an organisation you trust.
          The organisation will vote for your proposal.
          You also need to follow the rules of the organisation.
          For the specific rules, see 'Organisations Tab'"
        >
          <i className="tmrwdao-icon-information text-[18px] text-lightGrey align-bottom" />
        </Tooltip>
      </span>
    ),
    rules: {
      required: "Organisation is required",
    },
  },
  formContractAddress: {
    name: "formContractAddress",
    label: "Contract Address",
    rules: {
      required: "Contract Address is required",
    },
  },
  formContractMethod: {
    name: "formContractMethod",
    label: "Method Name",
    placeholder: "Please select a contract method",
    rules: {
      required: "Method Name is required",
    },
  },
  params: {
    label: "Method Params",
  },
  formExpiredTime: {
    name: "formExpiredTime",
    label: (
      <span className="flex gap-2">
        Expiration Time
        <Tooltip title="Proposals must be voted on and released before the expiration time">
          <i className="tmrwdao-icon-information text-[18px] text-lightGrey align-bottom" />
        </Tooltip>
      </span>
    ),
    placeholder: "Please select a time",
    rules: {
      required: "Expiration Time is required",
      validate: {
        isAfterNow: (value) => {
          if (!value) return true;
          return dayjs(value).isAfter(dayjs()) || 'Expiration time must be later than current time';
        }
      }
    },
  },
  formDescriptionURL: {
    name: "formDescriptionURL",
    label: (
      <>
        Discussion on Forum:
        <span className="mx-2 text-descM14 text-lightGrey font-Montserrat">(Optional)</span>
        <Tooltip title="Please provide a URL describing the proposal">
          <i className="tmrwdao-icon-information text-[18px] text-lightGrey align-bottom" />
        </Tooltip>
      </>
    ),
    placeholder: "Please input the forum URL of proposal",
    validateTrigger: "onBlur",
    rules: {
      validate: {
        validator(value) {
          if (value && value.length > 0 && !validateURL(`https://${value}`)) {
            return "Please check your URL format";
          }
          return true;
        },
      },
    },
  },
};

const contractFilter = (input, _, list) =>
  list.filter(
    ({ contractName, address }) =>
      contractName.indexOf(input) > -1 || address.indexOf(input) > -1
  ).length > 0;

async function getOrganizationBySearch(
  currentWallet,
  proposalType,
  search = ""
) {
  return request(
    API_PATH.GET_AUDIT_ORGANIZATIONS,
    {
      address: currentWallet.address,
      search,
      proposalType,
    },
    { method: "GET" }
  );
}

async function getContractAddress(search = "") {
  return request(
    API_PATH.GET_ALL_CONTRACTS,
    {
      search,
    },
    { method: "GET" }
  );
}

function parsedParams(inputType, originalParams) {
  const fieldsLength = Object.keys(inputType.toJSON().fields || {}).length;
  let result = {};
  if (fieldsLength === 0) {
    return "";
  }
  if (isInnerType(inputType)) {
    const type = inputType.fieldsArray[0];
    return originalParams[type.name];
  }
  Object.keys(originalParams).forEach((name) => {
    const value = originalParams[name];
    const type = inputType.fields[name];
    if (value === "" || value === null || value === undefined) {
      return;
    }
    if (
      !Array.isArray(value) &&
      typeof value === "object" &&
      value !== null &&
      (type.type || "").indexOf("google.protobuf.Timestamp") === -1
    ) {
      result = {
        ...result,
        [name]: parsedParams(type.resolvedType, value),
      };
    } else if ((type.type || "").indexOf("google.protobuf.Timestamp") > -1) {
      result = {
        ...result,
        [name]: Array.isArray(value)
          ? value.filter((v) => v).map(formatTimeToNano)
          : formatTimeToNano(value),
      };
    } else if (isSpecialParameters(type)) {
      result = {
        ...result,
        [name]: Array.isArray(value) ? value.filter((v) => v) : value,
      };
    } else {
      result = {
        ...result,
        [name]: Array.isArray(value) ? value.filter((v) => v) : value,
      };
    }
  });
  return result;
}

// eslint-disable-next-line no-unused-vars
function parsedParamsWithoutSpecial(inputType, originalParams) {
  const fieldsLength = Object.keys(inputType.toJSON().fields || {}).length;
  let result = {};
  if (fieldsLength === 0) {
    return result;
  }
  Object.keys(originalParams).forEach((name) => {
    const value = originalParams[name];
    const type = inputType.fields[name];
    if (value === "" || value === null || value === undefined) {
      return;
    }
    if (
      !Array.isArray(value) &&
      typeof value === "object" &&
      value !== null &&
      (type.type || "").indexOf("google.protobuf.Timestamp") === -1
    ) {
      result = {
        ...result,
        [name]: parsedParams(type.resolvedType, value),
      };
    } else if ((type.type || "").indexOf("google.protobuf.Timestamp") > -1) {
      result = {
        ...result,
        [name]: Array.isArray(value)
          ? value.filter((v) => v).map(formatTimeToNano)
          : formatTimeToNano(value),
      };
    } else if ((type.type || "").indexOf("int") > -1) {
      result = {
        ...result,
        [name]: Array.isArray(value)
          ? value.filter((v) => parseInt(v, 10))
          : parseInt(value, 10),
      };
    } else {
      result = {
        ...result,
        [name]: Array.isArray(value) ? value.filter((v) => v) : value,
      };
    }
  });
  return result;
}

// Ordinary Proposal
const NormalProposal = (props) => {
  const {
    aelf,
    isModify,
    proposalType,
    orgAddress,
    contractAddress,
    submit,
    currentWallet,
  } = props;
  const [organizationList, setOrganizationList] = useState([]);
  const [contractList, setContractList] = useState([]);
  const [methods, setMethods] = useState({
    list: [],
    contractAddress: "",
    methodName: "",
    isEmpty: true,
    isSingleString: false,
  });
  const [loadingStatus, setLoadingStatus] = useState({
    orgAddress: false,
    contractAddress: false,
    contractMethod: false,
  });

  const { control, formState: { errors }, trigger, watch, setValue, getValues } = useForm({
    defaultValues: {
      title: "",
      description: "",
      formProposalType: isModify ? proposalType : "",
      formOrgAddress: isModify ? orgAddress : "",
      formContractAddress: isModify ? contractAddress : "",
      formPrefix: "https://",
      realSpecialPlain: JSON.stringify(
        {
          'parameter name': 'Please enter the content of your parameter.',
        },
        null,
        2,
      ),
      formExpiredTime: dayjs().add(1, 'day').toDate(),
      formDescriptionURL: ""
    },
    mode: "onChange",
  });

  const formExpiredTime = watch('formExpiredTime');

  const handleContractAddressChange = async (address) => {
    let list = [];
    try {
      setValue("formContractMethod", "");
      setMethods({
        ...methods,
        list: [],
        contractAddress: "",
        methodName: "",
      });
      setLoadingStatus({
        ...loadingStatus,
        contractAddress: false,
        contractMethod: true,
      });
      list = await getContractMethodList(aelf, address);
    } catch (e) {
      toast.error(e.message || "Querying contract address list failed!");
    } finally {
      setLoadingStatus({
        ...loadingStatus,
        contractMethod: false,
        contractAddress: false,
      });
      setMethods({
        ...methods,
        list,
        contractAddress: address,
        methodName: "",
      });
    }
  };

  const handleProposalTypeChange = async (type) => {
    let list = [];
    try {
      setValue("formOrgAddress", "");
      setLoadingStatus({
        ...loadingStatus,
        contractAddress: false,
        orgAddress: true,
      });
      list = await getOrganizationBySearch(currentWallet, type);
      list = list || [];
    } catch (e) {
      toast.error(e.message || "Querying contract address list failed!");
    } finally {
      setLoadingStatus({
        ...loadingStatus,
        contractAddress: false,
        orgAddress: false,
      });
      setOrganizationList(list);
    }
  };
  useEffect(() => {
    getContractAddress("")
      .then((res) => {
        setContractList(res.list);
        setLoadingStatus({
          ...loadingStatus,
          contractAddress: false,
        });
      })
      .catch((e) => {
        setLoadingStatus({
          ...loadingStatus,
          contractAddress: false,
        });
        message.error(e.message || "Network Error!");
      });
    if (isModify === true) {
      handleContractAddressChange(contractAddress);
      getOrganizationBySearch(currentWallet, proposalType).then((res) => {
        setOrganizationList(res);
      });
    }
  }, []);

  const handleMethodChange = (method) => {
    setMethods({
      ...methods,
      methodName: method,
      isSingleString: isSingleStringParameter(
        CONTRACT_INSTANCE_MAP[methods.contractAddress][method].inputType
      ),
      isEmpty: isEmptyInputType(
        CONTRACT_INSTANCE_MAP[methods.contractAddress][method].inputType
      ),
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await trigger();
      if (!res) return;
      const data = getValues();const {
        formProposalType,
        formOrgAddress,
        formContractAddress,
        formContractMethod,
        formExpiredTime,
        formDescriptionURL,
        formPrefix,
        title,
        description,
        ...leftParams
      } = data;
      const method = CONTRACT_INSTANCE_MAP[methods.contractAddress][methods.methodName];
      const { inputType } = method;
      let parsed;
      if (methods.isSingleString) {
        parsed = parsedParams(inputType, leftParams);
      } else {
        parsed = parseJSON(leftParams.realSpecialPlain);
      }

      let decoded;
      if (Array.isArray(parsed)) {
        decoded = method.packInput([...parsed]);
      } else if (typeof parsed === "object" && parsed !== null) {
        decoded = method.packInput(JSON.parse(JSON.stringify(parsed)));
      } else {
        decoded = method.packInput(parsed);
      }
      submit({
        title,
        description,
        expiredTime: formExpiredTime,
        contractMethodName: formContractMethod,
        toAddress: formContractAddress,
        proposalType: formProposalType,
        organizationAddress: formOrgAddress,
        proposalDescriptionUrl:
          formDescriptionURL && formDescriptionURL.length > 0
            ? `${formPrefix}${formDescriptionURL}`
            : "",
        params: {
          origin: parsed,
          decoded,
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="py-6 px-[38px]">
      <form>
        <FormItem
          label="Title"
          errorText={errors?.title?.message}
        >
          <Controller
            name="title"
            control={control}
            rules={FIELDS_MAP.title.rules}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={FIELDS_MAP.title.placeholder}
                isError={!!errors?.title}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Description"
          errorText={errors?.description?.message}
        >
          <Controller
            name="description"
            control={control}
            rules={FIELDS_MAP.description.rules}
            render={({ field }) => (
              <TextArea
                {...field}
                maxLength={240}
                rootClassName="h-[61px]"
                placeholder={FIELDS_MAP.description.placeholder}
                isError={!!errors?.description}
              />
            )}
          />
        </FormItem>

        <FormItem
          label={
            <div className="flex items-center gap-2">
              <span>Proposal Mode</span>
              <Tooltip title="There are currently three proposal models. After selecting one, you will need to operate according to its rules. For specific rules, see 'Proposal rules'">
                <i className="tmrwdao-icon-information text-[16px] text-lightGrey align-bottom" />
              </Tooltip>
            </div>
          }
          errorText={errors?.formProposalType?.message}
        >
          <Controller
            name="formProposalType"
            control={control}
            rules={FIELDS_MAP.formProposalType.rules}
            render={({ field }) => (
              <Select
                {...field}
                placeholder={FIELDS_MAP.formProposalType.placeholder}
                options={[
                  { label: proposalTypes.PARLIAMENT, value: proposalTypes.PARLIAMENT },
                  { label: proposalTypes.ASSOCIATION, value: proposalTypes.ASSOCIATION },
                  { label: proposalTypes.REFERENDUM, value: proposalTypes.REFERENDUM },
                ]}
                onChange={({ value }) => {
                  field.onChange(value);
                  handleProposalTypeChange(value);
                }}
                isError={!!errors?.formProposalType}
              />
            )}
          />
        </FormItem>
        <FormItem
          label={
            <div className="flex items-center gap-2">
              <span>Organisation</span>
              <Tooltip title="Choose an organisation you trust. The organisation will vote for your proposal. You also need to follow the rules of the organisation. For the specific rules, see 'Organisations Tab'">
                <i className="tmrwdao-icon-information text-[16px] text-lightGrey align-bottom" />
              </Tooltip>
            </div>
          }
          errorText={errors?.formOrgAddress?.message}
        >
          <Controller
            name="formOrgAddress"
            control={control}
            rules={FIELDS_MAP.formOrgAddress.rules}
            render={({ field }) => (
              <Select
                {...field}
                placeholder={FIELDS_MAP.formOrgAddress.placeholder}
                loading={loadingStatus.orgAddress}
                options={organizationList.map((v) => ({ label: v, value: v }))}
                showSearch
                filterOption={commonFilter}
                onChange={({ value }) => field.onChange(value)}
                isError={!!errors?.formOrgAddress}
              />
            )}
          />
        </FormItem>
        <FormItem
          {...FIELDS_MAP.formContractAddress}
          errorText={errors.formContractAddress?.message}
        >
          <Controller
            name={FIELDS_MAP.formContractAddress.name}
            control={control}
            rules={FIELDS_MAP.formOrgAddress.rules}
            render={({ field }) => (
              <Select
                options={contractList.map((v) => ({ label: v.contractName || v.address, value: v.address }))}
                placeholder={FIELDS_MAP.formContractAddress.placeholder}
                onChange={({ value }) => {
                  field.onChange(value);
                  handleContractAddressChange(value);
                }}
                optionFilterProp="children"
                filterOption={(...args) => contractFilter(...args, contractList)}
                loading={loadingStatus.contractAddress}
                isError={!!errors?.formContractAddress}
              />
            )}
          />
        </FormItem>
        <FormItem
          label={FIELDS_MAP.formContractMethod.label}
          errorText={errors.formContractMethod?.message}
        >
          <Controller
            name={FIELDS_MAP.formContractMethod.name}
            control={control}
            rules={FIELDS_MAP.formOrgAddress.rules}
            render={({ field }) => (
              <Select
                placeholder={FIELDS_MAP.formContractMethod.placeholder}
                options={methods.list.map((v) => ({ label: v, value: v }))}
                optionFilterProp="children"
                filterOption={commonFilter}
                loading={loadingStatus.contractMethod}
                isError={!!errors?.formContractMethod}
                onChange={({ value }) => {
                  field.onChange(value);
                  handleMethodChange(value);
                }}
              />
            )}
          />
        </FormItem>
        <FormItem
          label={FIELDS_MAP.params.label}
          errorText={errors.realSpecialPlain?.message}
        >
          <Controller
            name="realSpecialPlain"
            control={control}
            rules={{ required: 'Method Params is required' }}
            render={({ field }) => methods &&
              methods.methodName &&
              !methods.isEmpty && (
              <div className="border-solid border-fillBg8 border-[1px] rounded-[8px] py-[13px]">
                <Editor
                  value={field.value}
                  language={methods.isSingleString ? "plaintext" : "json"}
                  theme="vs-dark"
                  className="proposal-custom-action-params-editor"
                  height={176}
                  options={{
                    minimap: {
                      enabled: false,
                    },
                    fontSize: 14,
                    codeLensFontSize: 14,
                  }}
                  onChange={(value) => {
                    console.log(value);
                    field.onChange(value);
                  }}
                />
              </div>
            )}
          />
        </FormItem>
        <FormItem
          label={FIELDS_MAP.formDescriptionURL.label}
          errorText={errors.formDescriptionURL?.message}
        >
          <div className="flex items-center">
            <Controller
              name="formPrefix"
              control={control}
              rules={{ required: 'Prefix is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  className="rounded-r-none border-r-0 h-[47px]"
                  options={[
                    { label: "https://", value: "https://" },
                    { label: "http://", value: "http://" },
                  ]}
                  onChange={({ value }) => field.onChange(value)}
                />
              )}
            />
            <Controller
              name="formDescriptionURL"
              control={control}
              rules={FIELDS_MAP.formDescriptionURL.rules}
              render={({ field }) => (
                <Input
                  {...field}
                  className="rounded-l-none"
                  placeholder={FIELDS_MAP.formDescriptionURL.placeholder}
                  isError={!!errors?.formDescriptionURL}
                />
              )}
            />
          </div>
        </FormItem>
        <FormItem
          label={FIELDS_MAP.formExpiredTime.label}
          errorText={errors.formExpiredTime?.message}
        >
          <Controller
            name={FIELDS_MAP.formExpiredTime.name}
            control={control}
            rules={FIELDS_MAP.formExpiredTime.rules}
            render={({ field }) => (
              <div className="flex flex-row items-center flex-wrap gap-[9px]">
                <SimpleDatePicker
                  className="flex-1"
                  disabled={{
                    before: dayjs().add(1, 'day').toDate(),
                  }}
                  value={field.value}
                  onChange={(day) =>
                    field.onChange(combineDateAndTime(day, formExpiredTime))
                  }
                />
                <SimpleTimePicker
                  className="flex-1"
                  value={field.value}
                  onChange={(time) => field.onChange(combineDateAndTime(formExpiredTime, time))}
                />
              </div>
            )}
          />
        </FormItem>
        <div className="flex items-center justify-end">
          <Button
            className="apply-btn"
            type="primary"
            onClick={handleSubmit}
          >
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
};

NormalProposal.propTypes = {
  aelf: PropTypes.shape({
    // eslint-disable-next-line react/forbid-prop-types
    chain: PropTypes.object,
  }).isRequired,
  isModify: PropTypes.bool.isRequired,
  proposalType: PropTypes.string,
  orgAddress: PropTypes.string,
  contractAddress: PropTypes.string,
  submit: PropTypes.func.isRequired,
  wallet: PropTypes.shape({
    sign: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
  }).isRequired,
  currentWallet: PropTypes.shape({
    address: PropTypes.string,
    publicKey: PropTypes.string,
  }).isRequired,
};

NormalProposal.defaultProps = {
  proposalType: "",
  orgAddress: "",
  contractAddress: "",
};

export default NormalProposal;
