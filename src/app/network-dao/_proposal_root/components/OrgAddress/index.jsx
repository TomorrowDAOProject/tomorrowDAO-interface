/**
 * @file org address
 * @author atom-yang
 */
import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { useDispatch } from "react-redux";
import getChainIdQuery from 'utils/url';
import useNetworkDaoRouter from "hooks/useNetworkDaoRouter";
import { setCurrentOrg } from "@redux/actions/proposalDetail";
import config from "@common/config";
import "./index.css";

const OrgAddress = (props) => {
  const dispatch = useDispatch();
  const router = useNetworkDaoRouter()
  const { orgAddress, proposalType } = props;
  function handleClick() {
    dispatch(
      setCurrentOrg({
        orgAddress,
        proposalType,
      })
    );
    const chainIdQuery = getChainIdQuery();
    router.push(`/apply?orgAddress=${orgAddress}&${chainIdQuery.chainIdQueryString}`)
  }
  return (
    <Button
      className='text-ellipsis org-address-btn font-Montserrat !text-white'
      type='link'
      onClick={handleClick}
      title={`ELF_${orgAddress}_${config.viewer.chainId}`.slice(0, 8) + `ELF_${orgAddress}_${config.viewer.chainId}`.slice(-8)}
    >
      {/* {`ELF_${orgAddress}_${config.viewer.chainId}`} */}
      {`ELF_${orgAddress}_${config.viewer.chainId}`.slice(0, 8) + '...' + `ELF_${orgAddress}_${config.viewer.chainId}`.slice(-8)}
    </Button>
  );
};

OrgAddress.propTypes = {
  orgAddress: PropTypes.string.isRequired,
  proposalType: PropTypes.string.isRequired,
};

export default React.memo(OrgAddress);
