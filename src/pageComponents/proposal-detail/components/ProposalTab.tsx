import { HashAddress } from 'aelf-design';
// import { Tabs } from 'aelf-design';
import Tabs from 'components/Tabs';
import { getContract } from 'pageComponents/proposal-create/util';
import { MarkdownPreview } from 'components/MarkdownEditor';
import { curChain } from 'config';
import { SetStateAction, useEffect, useState } from 'react';
import { ProposalTypeString } from 'types';
import base64ToHex from 'utils/base64ToHex';

interface IProposalTabProps {
  proposalDetailData?: IProposalDetailData;
}
interface IContractParamsProps {
  address: string;
  methodName: string;
  params: string;
}
const ContractParams = (props: IContractParamsProps) => {
  const { address, methodName, params } = props;
  const [parsedParams, setParams] = useState(params);
  useEffect(() => {
    if (!address || !methodName || !params) {
      return;
    }
    getContract(address)
      .then((contract) => {
        const decoded = contract[methodName].unpackPackedInput(base64ToHex(params));
        setParams(JSON.stringify(decoded, null, 2));
      })
      .catch((e) => {
        console.error('contract params decode error', e);
      });
  }, [address, methodName, params]);
  return <pre className="view-params">{parsedParams}</pre>;
};
const ProposalTab = (props: IProposalTabProps) => {
  const { proposalDetailData } = props;
  const tabItems = [
    {
      key: '1',
      label: <span className="flex flex-col lg:flex-row">Description</span>,
      children: (
        <div className="text-base tabpanel-content-padding">
          <div className="custom-html-style">
            <MarkdownPreview text={proposalDetailData?.proposalDescription ?? ''} />
          </div>
        </div>
      ),
    },
  ];
  if (proposalDetailData?.proposalType === ProposalTypeString.Governance) {
    tabItems.push({
      key: '2',
      label: (
        <span className="flex flex-col lg:flex-row">
          <span>Contract</span>
          <span className="lg:pl-[4px] pl-[0px]">Information</span>
        </span>
      ),
      children: (
        <div className="text-base	tabpanel-content-padding tab-contract-info text-white">
          <div className="flex flex-col gap-2 pb-8">
            <div className="card-sm-text-bold">Call Method</div>
            <div className="card-sm-text text-[#808080]">
              {proposalDetailData?.transaction?.contractMethodName ?? '-'}
            </div>
          </div>

          <div className="flex flex-col gap-2 pb-8">
            <div className="card-sm-text-bold">Call Contract</div>
            <div>
              <HashAddress
                className="card-sm-text "
                address={proposalDetailData?.transaction?.toAddress ?? '-'}
                chain={curChain}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="card-sm-text-bold">Contract Params</div>
            <div className="p-4 rounded-md bg-fillBg8 card-sm-text text-white">
              <ContractParams
                address={proposalDetailData?.transaction?.toAddress}
                methodName={proposalDetailData?.transaction?.contractMethodName}
                params={proposalDetailData?.transaction?.params?.param}
              />
            </div>
          </div>
        </div>
      ),
    });
  }

  const [activeTab, setActiveTab] = useState('1');

  const changeTab = (value: SetStateAction<string>) => {
    setActiveTab(value);
  };
  return <Tabs items={tabItems} activeKey={activeTab} onChange={changeTab} />;
};
export { ProposalTab };
