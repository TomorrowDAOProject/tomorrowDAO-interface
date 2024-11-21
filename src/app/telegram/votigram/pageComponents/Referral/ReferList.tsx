import { DownOutlined, QuestionCircleOutlined } from '@aelf-design/icons';
import { Button, HashAddress } from 'aelf-design';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import Loading from '../../components/Loading';
import CommonModal, { ICommonModalRef } from '../../components/CommonModal';
import { useEffect, useRef, useState } from 'react';
import { curChain } from 'config';

interface IReferListProps {
  onViewMore?: () => void;
  isShowMore?: boolean;
  list: IInviterInfo[];
  isLoading?: boolean;
  me?: IInviterInfo;
}

type MyInfoType = {
  first_name: string;
  last_name: string;
  photo_url: string;
};

export default function ReferList(props: IReferListProps) {
  const { onViewMore, isShowMore, list, me, isLoading } = props;
  const [myInfo, setMyInfo] = useState<MyInfoType>();
  const invitedModalRef = useRef<ICommonModalRef>(null);
  const { walletInfo: wallet } = useConnectWallet();

  useEffect(() => {
    if (window?.Telegram) {
      const { first_name, last_name, photo_url } =
        window?.Telegram?.WebApp?.initDataUnsafe.user || {};
      setMyInfo({
        first_name,
        last_name,
        photo_url,
      });
    }
  }, []);

  return (
    <div className="leaderboard-wrap">
      <ul className="header">
        <li className="left">Rank</li>
        <li className="main">Name</li>
        <li className="right">
          Invited <QuestionCircleOutlined onClick={() => invitedModalRef.current?.open()} />
        </li>
      </ul>
      {isLoading ? (
        <div className="flex-center">
          <Loading />
        </div>
      ) : (
        <>
          <ul className="top-wrap">
            <li className="left">{me?.rank ?? '--'}</li>
            <li className="main">
              {myInfo?.photo_url ? (
                <img className="w-5 h-5 rounded-full" src={myInfo.photo_url} />
              ) : (
                <img
                  className="w-5 h-5 rounded-full"
                  src="https://cdn.tmrwdao.com/assets/imgs/F40486EA32B7.webp"
                />
              )}
              {myInfo?.first_name && myInfo?.last_name ? (
                <span className="truncate max-w-[145px]">
                  {myInfo.first_name} {myInfo.last_name}
                </span>
              ) : (
                <HashAddress
                  address={wallet?.address || ''}
                  hasCopy={false}
                  preLen={8}
                  endLen={9}
                  chain={curChain}
                />
              )}
              <div className="me-tag flex-center">Me</div>
            </li>
            <li className="right">{me?.inviteAndVoteCount.toLocaleString() ?? 0}</li>
          </ul>
          <div>
            {list?.map((item, index) => (
              <ul className="invite-item" key={item.inviter}>
                <li className="left">
                  {[0, 1, 2].includes(index) ? (
                    <img
                      src={`/images/tg/rank-icon-${index}.png`}
                      className="vote-item-icon"
                      alt="rank-icon"
                      width={10}
                      height={20}
                    />
                  ) : (
                    item.rank
                  )}
                </li>
                <li className="main">
                  {item?.icon ? (
                    <img className="w-5 h-5 rounded-full" src={item.icon} />
                  ) : (
                    <img
                      className="w-5 h-5 rounded-full"
                      src="https://cdn.tmrwdao.com/assets/imgs/F40486EA32B7.webp"
                    />
                  )}
                  {item?.firstName && item?.lastName ? (
                    <span className="truncate max-w-[145px]">
                      {item.firstName} {item.lastName}
                    </span>
                  ) : (
                    <HashAddress
                      address={item?.inviter || ''}
                      hasCopy={false}
                      preLen={8}
                      endLen={9}
                      chain={curChain}
                    />
                  )}
                </li>
                <li className="right">{item.inviteAndVoteCount.toLocaleString()}</li>
              </ul>
            ))}
          </div>
        </>
      )}

      {isShowMore && (
        <div className="view-more" onClick={onViewMore}>
          <span className="view-more-text">View More</span>
          <DownOutlined />
        </div>
      )}
      <CommonModal
        ref={invitedModalRef}
        title="Invited"
        content={
          <div className="invite-modal-content">
            <p className="my-[24px]">
              Only sign up on Votigram via referral that have completed vote in Votigram during the
              event will be counted here.
            </p>
            <Button
              type="primary"
              onClick={() => {
                invitedModalRef.current?.close();
              }}
            >
              OK
            </Button>
          </div>
        }
      />
    </div>
  );
}
