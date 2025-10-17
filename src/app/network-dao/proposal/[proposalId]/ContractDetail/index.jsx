/**
 * @file desc list
 * @author atom-yang
 */
// eslint-disable-next-line no-use-before-define
import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { If, Then } from "react-if";
import config from "@common/config";
import { base64ToHex } from "@redux/common/utils";
import { getContract } from "@common/utils";
import addressFormat from "@utils/addressFormat";
import { isJsonString } from "@utils/utils";
import { explorer, mainExplorer } from "config";
import { useChainSelect } from "hooks/useChainSelect";
import Tooltip from "components/Tooltip";
import Row from "components/Grid/Row";
import Col from "components/Grid/Col";
import Tag from "components/Tag";
import { getAddress, fetchContractName } from 'api/request';
import getChainIdQuery from 'utils/url';

const { viewer } = config;

export function getContractURL(address, isSideChain) {
  // eslint-disable-next-line max-len
  return `${isSideChain ? explorer : mainExplorer}/address/${address}?tab=contract`;
}

const ContractDetail = (props) => {
  const {
    aelf,
    contractAddress,
    contractMethod,
    contractParams,
    createdBy,
    ...rest
  } = props;
  const [name, setName] = useState("");
  const [params, setParams] = useState(contractParams);
  const { isSideChain } = useChainSelect();

  const getContractName = useCallback(async (address, isSideChain) => {
    const res = await fetchContractName({
      chainId: getChainIdQuery()?.chainId || 'AELF',
      address: getAddress(address)
    }, isSideChain);
    const contractName = res?.data?.contractName;
    if (contractName) {
      setName(contractName);
    } else {
      setName("");
    }
  }, [setName]);

  useEffect(() => {
    getContractName(contractAddress, isSideChain);
    // history reason:
    // deploy contract on mainnet before node code update
    // will cause the contractParams cannot be parsed to json
    // so we need to check the contractMethod is 'PerformDeployUserSmartContract' or not
    if (
      (createdBy === "SYSTEM_CONTRACT" &&
        contractMethod !== "PerformDeployUserSmartContract") ||
      isJsonString(contractParams)
    ) {
      try {
        setParams(JSON.stringify(JSON.parse(contractParams), null, 2));
      } catch (e) {
        getContract(aelf, contractAddress).then((contract) => {
          const decoded = contract[contractMethod].unpackPackedInput(
            base64ToHex(contractParams)
          );
          setParams(JSON.stringify(decoded, null, 2));
        }).catch(e => {
          setParams(contractParams);
        })
      }
    } else if (contractParams) {
      getContract(aelf, contractAddress)
        .then((contract) => {
          const decoded = contract[contractMethod].unpackPackedInput(
            base64ToHex(contractParams)
          );
          setParams(JSON.stringify(decoded, null, 2));
        })
        .catch((e) => {
          console.error(e);
          // message.error(e.message || 'Chain server is not reachable');
        });
    } else {
      setParams(JSON.stringify(null, null, 2));
    }
  }, [contractAddress]);
  const ref = useRef(null);
  useEffect(() => {
    ref.current.innerHTML = params;
  }, [params])

  return (
    <div
      {...rest}
    >
      <span className="block mb-[30px] text-descM13 text-white font-Montserrat">
        Contract Details
        <Tooltip title="Specific information about the contract invoked by the proposal">
          <i className="tmrwdao-icon-information ml-2 text-[18px] text-lightGrey align-middle" />
        </Tooltip>
      </span>
      <div className="flex flex-col gap-6">
        <If condition={!!name}>
          <Then>
            <>
              <Row gutter={24} className="!gap-y-[5px]">
                <Col sm={24} md={6}>
                    <span className="text-desc12 text-lightGrey font-Montserrat">Contract Name</span>
                  </Col>
                  <Col sm={24} md={18}>
                    <span className="text-desc12 text-white font-Montserrat">{name}</span>
                  </Col>
                </Row>
              </>
            </Then>
          </If>
          <Row gutter={24} className="!gap-y-[5px]">
            <Col sm={24} md={6}>
              <span className="text-desc12 text-lightGrey font-Montserrat">Contract Address</span>
            </Col>
          <Col sm={24} md={18}>
            <a
              className="text-desc12 text-secondaryMainColor font-Montserrat break-words whitespace-pre-wrap hover:text-mainColor"
              href={getContractURL(addressFormat(contractAddress), isSideChain)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {`ELF_${contractAddress}_${viewer.chainId}`}
            </a>
          </Col>
        </Row>
        <Row gutter={24} className="!gap-y-[5px]">
          <Col sm={24} md={6}>
            <span className="text-desc12 text-lightGrey font-Montserrat">Contract Method Name</span>
          </Col>
          <Col sm={24} md={18}>
            <Tag color="primary">{contractMethod}</Tag>
          </Col>
        </Row>
        <Row gutter={24} className="!gap-y-[5px]">
          <Col sm={24} md={6}>
            <span className="text-desc12 text-lightGrey font-Montserrat">Contract Params</span>
          </Col>
          <Col sm={24} md={18}>
            <pre className="bg-transparent rounded-[8px] p-4
            border border-fillBg8 border-solid max-h-[200px] overflow-scroll
            text-desc14 text-lightGrey font-Montserrat text-wrap break-all"
                 ref={ref}>{params}</pre>
          </Col>
        </Row>
      </div>
    </div>
  );
};

ContractDetail.propTypes = {
  aelf: PropTypes.shape({
    // eslint-disable-next-line react/forbid-prop-types
    chain: PropTypes.object,
  }).isRequired,
  contractAddress: PropTypes.string.isRequired,
  contractMethod: PropTypes.string.isRequired,
  contractParams: PropTypes.string.isRequired,
  createdBy: PropTypes.oneOf(["USER", "SYSTEM_CONTRACT"]).isRequired,
};

export default ContractDetail;
