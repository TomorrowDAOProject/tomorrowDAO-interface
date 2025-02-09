'use client';
import { memo, useEffect } from 'react';
import { Result } from 'antd';
import { useParams } from 'next/navigation';
import DeployForm from './DeployForm';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

import breadCrumb from 'utils/breadCrumb';
import './index.css';
import 'styles/proposal-create.css';

const ProposalDeploy = () => {
  const { walletInfo } = useConnectWallet();
  const { aliasName } = useParams<{ aliasName: string }>();
  useEffect(() => {
    breadCrumb.updateCreateProposalPage(aliasName);
  }, [aliasName]);
  return walletInfo ? (
    <div className="deploy-form">
      <DeployForm aliasName={aliasName} />
    </div>
  ) : (
    <Result
      className="px-4 lg:px-8 !font-Montserrat !text-white"
      status="warning"
      title="Please log in before creating a proposal"
    />
  );
};

export default memo(ProposalDeploy);
