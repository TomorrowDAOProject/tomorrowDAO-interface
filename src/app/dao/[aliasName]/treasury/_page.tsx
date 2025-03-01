'use client';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import Treasury from 'pageComponents/treasuryNew';
import { curChain } from 'config';
import { useRequest } from 'ahooks';
import breadCrumb from 'utils/breadCrumb';
import { fetchDaoInfo } from 'api/request';
import { useRouter } from 'next/navigation';

interface ITreasuryDetailsProps {
  aliasName: string;
  ssrData: {
    treasuryAddress: string;
  };
}
export default function TreasuryDetails(props: ITreasuryDetailsProps) {
  const { aliasName, ssrData } = props;
  const router = useRouter();
  const { data: daoData } = useRequest(async () => {
    if (!aliasName) {
      toast.error('aliasName is required');
      return null;
    }
    return fetchDaoInfo({ alias: aliasName, chainId: curChain });
  });
  useEffect(() => {
    breadCrumb.updateTreasuryPage(aliasName);
  }, [aliasName]);
  return (
    <div className="mx-[20px] my-[39px] md:w-[840px] lg:w-[1056px] xl:w-[1120px] md:m-auto lg:m-auto xl:m-auto xl:my-[51px] lg:my-[51px] md:my-[51px] revamp-dao">
      <div className="text-white font-Montserrat flex items-center gap-2 pb-[25px]">
        <span
          className="text-lightGrey text-[15px] cursor-pointer"
          onClick={() => router.push('/')}
        >
          Home
        </span>
        <i className="tmrwdao-icon-arrow text-[16px] text-lightGrey" />
        <span
          className="text-lightGrey text-[15px] cursor-pointer"
          onClick={() => router.push('/explore')}
        >
          Explore
        </span>
        <i className="tmrwdao-icon-arrow text-[16px] text-lightGrey" />
        <span
          className="text-lightGrey text-[15px] cursor-pointer"
          onClick={() =>
            router.push(`/dao/${daoData?.data?.metadata?.name.toLowerCase().replace(/\s+/g, '-')}`)
          }
        >
          {daoData?.data?.metadata?.name}
        </span>
        <i className="tmrwdao-icon-arrow text-[16px] text-lightGrey" />
        <span className="text-[14px]">Treasury</span>
      </div>
      <Treasury
        aliasName={aliasName}
        address={ssrData?.treasuryAddress}
        currentChain={curChain}
        title={`${daoData?.data?.metadata?.name ?? 'DAO'} Treasury`}
        isNetworkDao={false}
      />
    </div>
  );
}
