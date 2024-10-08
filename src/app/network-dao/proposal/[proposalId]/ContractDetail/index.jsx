/**
 * @file desc list
 * @author atom-yang
 */
// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { If, Then } from "react-if";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip, Row, Col, Tag } from "antd";
import { API_PATH } from "@redux/common/constants";
import { request } from "@common/request";
import config from "@common/config";
import { base64ToHex } from "@redux/common/utils";
import { getContract } from "@common/utils";
import { PRIMARY_COLOR } from "@common/constants";
import addressFormat from "@utils/addressFormat";
import { isJsonString } from "@utils/utils";
import { explorer, mainExplorer } from "config";
import { useChainSelect } from "hooks/useChainSelect";

const { viewer } = config;

function getContractName(address) {
  return request(
    API_PATH.GET_CONTRACT_NAME,
    {
      address,
    },
    { method: "GET" }
  );
}
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
  const { isSideChain } = useChainSelect()
  useEffect(() => {
    getContractName(contractAddress)
      .then((data) => {
        setName(data.name);
      })
      .catch(() => {
        setName("");
      });
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
      <h2 className="title">
        <span>
          Contract Details
          <Tooltip title="Specific information about the contract invoked by the proposal">
            <QuestionCircleOutlined className="icon" />
          </Tooltip>
        </span>
      </h2>
      <If condition={!!name}>
        <Then>
          <>
            <Row>
              <Col sm={4} xs={24}>
                <span className="network-dao-lable-key">Contract Name</span>
              </Col>
              <Col sm={20} xs={24}>
                {name}
              </Col>
            </Row>
            
          </>
        </Then>
      </If>
      <Row>
        <Col sm={4} xs={24}>
          <span className="network-dao-lable-key">Contract Address</span>
        </Col>
        <Col sm={20} xs={24}>
          <a
            className="break-all"
            href={getContractURL(addressFormat(contractAddress), isSideChain)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {`ELF_${contractAddress}_${viewer.chainId}`}
          </a>
        </Col>
      </Row>
      
      <Row>
        <Col sm={4} xs={24}>
          <span className="network-dao-lable-key">Contract Method Name</span>
        </Col>
        <Col sm={20} xs={24}>
          <Tag color={PRIMARY_COLOR}>{contractMethod}</Tag>
        </Col>
      </Row>
      
      <Row>
        <Col sm={4} xs={24}>
          <span className="network-dao-lable-key">Contract Params</span>
        </Col>
        <Col sm={20} xs={24}>
          <pre className="view-params" ref={ref}>{params}</pre>
        </Col>
      </Row>
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
