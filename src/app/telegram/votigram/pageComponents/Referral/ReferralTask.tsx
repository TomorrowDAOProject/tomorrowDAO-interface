import { DownArrowOutlined, LeftArrowOutlined, RightArrowOutlined } from '@aelf-design/icons';

export default function ReferralTask() {
  return (
    <div className="tg-information-card referral-task-wrap">
      <div className="top-logo">
        <img src="/images/tg/rectangle-top-border.png" alt="" />
        <h3 className="card-title-text font-16-20-weight">Referral Task</h3>
      </div>
      <div className="referral-task-wrap">
        <div className="referral-task-item left">
          <h2>You</h2>
          <div className="referral-task-item-rules left">
            <div className="text-item font-14-18">
              You share the referral link with your friend.
              <RightArrowOutlined />
            </div>
            <div className="text-item font-14-18">
              You earn <span className="bold">50,000</span> points.
              <LeftArrowOutlined />
            </div>
          </div>
        </div>
        <div className="split-line">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 100%" fill="none">
            <path
              d="M1.00002 1L1 400%"
              stroke="#403493"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 4"
            />
          </svg>
        </div>
        <div className="referral-task-item">
          <h2>Your Friends</h2>
          <div className="referral-task-item-rules right">
            <div className="text-item font-14-18">
              Your friend signs up on Votigram via your referral link.
            </div>
            <DownArrowOutlined />
            <div className="text-item font-14-18">Your friend completed a vote on Votigram.</div>
            <DownArrowOutlined />
            <div className="text-item font-14-18">
              Your friend earns <span className="bold">50,000</span> points.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
