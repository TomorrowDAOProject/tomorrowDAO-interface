// eslint-disable-next-line no-use-before-define
import React from "react";
import { toast } from "react-toastify";
import copy from "copy-to-clipboard";
import { omitString } from "@common/utils";
import addressFormat from "@utils/addressFormat";
import "./index.css";
import CopyButton from "@components/CopyButton/CopyButton";
import { explorer, mainExplorer } from "config";
import { useChainSelect } from "hooks/useChainSelect";
import { toast } from "react-toastify";

const checkName = (name: string) => {
  if (name === "-1") {
    return "-";
  }
  return name;
};
const AddressNameVer = ({ address, name, ver }) => {
  const { isSideChain } = useChainSelect()
  const handleCopy = () => {
    try {
      copy(address);
      // eslint-disable-next-line no-undef
      toast.success("Copied!");
    } catch (e) {
      toast.error("Copy failed, please copy by yourself.");
    }
  };
  return (
    <div className="address-name-ver">
      {address && (
        <div className="contract-address">
          <span className="label">Contract Address:</span>
          <span className="content">
            <a href={`${isSideChain ? explorer : mainExplorer}/address/${addressFormat(address)}`}>
              {omitString(address, 10, 10)}
            </a>
            <CopyButton
              value={`${isSideChain ? explorer : mainExplorer}/address/${addressFormat(address)}` as any}
              onClick={handleCopy as any}
            />
          </span>
        </div>
      )}
      {checkName(name) && (
        <div className="contract-name">
          <span className="label">Contract Name:</span>
          <span className="content">{checkName(name)}</span>
        </div>
      )}
      {checkName(name) && (
        <div className="contract-version">
          <span className="label">Version:</span>
          <span className="content">v{ver}</span>
        </div>
      )}
    </div>
  );
};
export default AddressNameVer;
