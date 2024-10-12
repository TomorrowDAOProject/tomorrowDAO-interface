import { DownOutlined, QuestionCircleOutlined } from '@aelf-design/icons';
import { Button, HashAddress } from 'aelf-design';
import { useWebLogin } from 'aelf-web-login';
import Loading from '../../components/Loading';
import CommonModal, { ICommonModalRef } from '../../components/CommonModal';
import { useRef } from 'react';
import { curChain } from 'config';

interface IReferListProps {
  onViewMore?: () => void;
  isShowMore?: boolean;
  list: IInviterInfo[];
  isLoading?: boolean;
  me?: IInviterInfo;
}
interface IFakeAvatarProps {
  text: string;
}
const FakeAvatar = (props: IFakeAvatarProps) => {
  const { text } = props;
  return <div className="fake-avatar">{text?.[0]?.toUpperCase()}</div>;
};
export default function ReferList(props: IReferListProps) {
  const { onViewMore, isShowMore, list, me, isLoading } = props;
  const invitedModalRef = useRef<ICommonModalRef>(null);
  const { wallet } = useWebLogin();
  return (
    <div className="leaderboard-wrap">
      <ul className="header">
        <li className="left">Rank</li>
        <li className="main">Wallet Address</li>
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
              <FakeAvatar text={wallet.address} />
              <HashAddress
                address={wallet.address}
                hasCopy={false}
                preLen={8}
                endLen={9}
                chain={curChain}
              />
              <div className="me-tag flex-center">Me</div>
            </li>
            <li className="right">{me?.inviteAndVoteCount ?? 0}</li>
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
                  <FakeAvatar text={item.inviter} />
                  <HashAddress
                    address={item.inviter}
                    hasCopy={false}
                    preLen={8}
                    endLen={9}
                    chain={curChain}
                  />
                </li>
                <li className="right">{item.inviteAndVoteCount}</li>
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
