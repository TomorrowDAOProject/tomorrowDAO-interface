import { Typography, FontWeightEnum, Button, HashAddress } from 'aelf-design';
import Image from 'next/image';
import arrowRightIcon from 'assets/imgs/arrow-right.svg';
import Link from 'next/link';
import { fetchVoteHistory } from 'api/request';
import { useSelector } from 'react-redux';
import { useRequest } from 'ahooks';
import { curChain } from 'config';
import { EVoteOption } from 'types/vote';
import dayjs from 'dayjs';

interface IStatus {
  Approved: string;
  Rejected: string;
  Asbtained: string;
  Executed: string;
}

const colorMap: IStatus = {
  Approved: '#3888FF',
  Rejected: '#F55D6E',
  Asbtained: '#687083',
  Executed: '#05C4A2',
};
interface IProps {
  daoId: string;
}
export default function MyRecords(props: IProps) {
  const { daoId } = props;
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  const {
    data: voteHistoryData,
    // error: voteHistoryError,
    // loading: voteHistoryLoading,
  } = useRequest(() => {
    return fetchVoteHistory({
      address: walletInfo.address,
      chainId: curChain,
      skipCount: 0,
      maxResultCount: 10,
      daoId,
    });
  });

  const statusCom = (text: keyof IStatus, size = 500) => {
    return (
      <span
        style={{
          color: colorMap[text],
          fontWeight: size,
        }}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="border border-Neutral-Divider border-solid rounded-lg bg-white mb-4 lg:my-4">
      <div className="px-4 lg:px-8 py-6 lg:py-4 flex justify-between items-center">
        <Typography.Title fontWeight={FontWeightEnum.Medium} level={6}>
          My Votes
        </Typography.Title>
        <div className="records-header-morebtn">
          <Link href={`/my-record?daoId=${daoId}`}>
            <Button type="link" size="medium" className="!p-0 text-[#1A1A1A]">
              Load More
              <Image width={12} height={12} src={arrowRightIcon} alt=""></Image>
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-h-96 overflow-scroll">
        {voteHistoryData?.data?.items?.map((item) => {
          return (
            <div
              className="flex justify-between items-center px-4 lg:px-8 max-h-80 mb-8"
              key={item.transactionId}
            >
              <div>
                <div className="time">
                  <span className="text-Neutral-Secondary-Text mr-2">
                    {dayjs(item.timeStamp).format('YYYY-MM-DD HH:mm:ss')}
                    <span className="pl-[4px]">{EVoteOption[item.myOption]}</span>
                  </span>
                </div>
                <div>
                  <span className="block lg:flex items-center">
                    <Typography.Text fontWeight={FontWeightEnum.Medium}>
                      transactionId:
                    </Typography.Text>

                    <HashAddress
                      className="pl-[4px]"
                      ignorePrefixSuffix={true}
                      preLen={8}
                      endLen={11}
                      address={item.transactionId}
                    ></HashAddress>
                  </span>
                </div>
                <div className="block lg:flex items-center">
                  <Typography.Text fontWeight={FontWeightEnum.Medium}>Proposal ID:</Typography.Text>
                  <HashAddress
                    className="pl-[4px]"
                    ignorePrefixSuffix={true}
                    preLen={8}
                    endLen={11}
                    address={item.proposalId}
                  ></HashAddress>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
