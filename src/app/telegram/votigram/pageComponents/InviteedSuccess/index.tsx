import { Button } from 'antd';
import { useRequest } from 'ahooks';
import { getReferralBindingStatus } from 'api/request';
import { curChain } from 'config';
import { useEffect, useMemo } from 'react';
import './index.css';
import Loading from '../../components/Loading';

interface IInvitedSuccessProps {
  onFinish: () => void;
}
export default function InvitedSuccess(props: IInvitedSuccessProps) {
  const { onFinish } = props;
  const {
    data: referralBindingStatus,
    run,
    cancel,
  } = useRequest(
    () =>
      getReferralBindingStatus({
        chainId: curChain,
      }),
    {
      manual: true,
      pollingInterval: 2000,
    },
  );
  useEffect(() => {
    run();
    return () => {
      cancel();
    };
  }, []);
  const isLoading = useMemo(() => {
    if (!referralBindingStatus?.data?.needBinding) {
      return false;
      // return true;
    }
    if (referralBindingStatus?.data?.bindingSuccess) {
      return false;
    }
    return true;
  }, [referralBindingStatus?.data]);
  return (
    <div className="invite-success-wrap">
      <img
        src="/images/tg/invite-success-vote-tip.png"
        alt="invite success tip"
        className="w-[240px] my-[32px]"
      />
      <div className="font-20-25-weight">🌈 Vote to Earn</div>
      <p className="font-14-18 mt-[8px] mb-[48px]">Complete referral tasks to earn points</p>
      <div className="tg-information-card">
        <div className="top-logo">
          <img src="/images/tg/rectangle-top-border.png" alt="" />
          <h3 className="card-title-text font-16-20-weight">Complete a Vote</h3>
        </div>
        <div className="font-14-18 p-[24px] invite-success-tip">
          {isLoading
            ? 'The system is binding the invitation relationship, please wait.'
            : `Once you complete a vote, the referral task is completed, and both you and inviter will
          earn 50,000 points`}
        </div>
        <div className="vote-btn-wrap">
          {isLoading ? (
            <Loading />
          ) : (
            <Button type="primary" className="vote-btn" onClick={onFinish}>
              <img src="/images/tg/vote-icon.png" alt="" width={24} height={24} />
              <span className="font-17-22-weight">Vote</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
