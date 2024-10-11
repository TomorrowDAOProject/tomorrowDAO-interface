import { RightOutlined, UpOutlined } from '@aelf-design/icons';
import { Button, Tooltip } from 'antd';
import Percent from './Percent';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';

import './index.css';
import CommonDrawer, { ICommonDrawerRef } from '../CommonDrawer';
import AppDetail from '../AppDetail';

export interface ILikeItem {
  likeAmount: number;
  alias: string;
}
interface IVoteItemProps {
  index: number;
  canVote: boolean;
  onVote?: (item: IRankingListResItem) => void;
  onReportClickCount: (item: ILikeItem) => void;
  item: IRankingListResItem;
  isToolTipVisible?: boolean;
  onLikeClick?: () => void;
  disableOperation?: boolean;
}
const increseIconDomCreate = (top: number, right: number) => {
  const div = document.createElement('div');
  div.className = 'increment-icon';
  div.innerText = '+1';
  div.style.top = `${top + 4}px`;
  div.style.right = `${right + 4}px`;
  return div;
};
const rankIndex = [0, 1, 2];
export default function VoteItem(props: IVoteItemProps) {
  const {
    index,
    onVote,
    item,
    canVote,
    onReportClickCount,
    isToolTipVisible,
    onLikeClick,
    disableOperation,
  } = props;
  const isRankIcon = rankIndex.includes(index);
  const domRef = useRef<HTMLDivElement>(null);
  const increseDomRef = useRef<HTMLImageElement>(null);
  const detailDrawerRef = useRef<ICommonDrawerRef>(null);
  const clickCount = useRef(0);
  const timer = useRef<NodeJS.Timer>();
  const [open, setOpen] = useState(false);

  const startTimer = () => {
    timer.current = setInterval(() => {
      if (clickCount.current > 0) {
        onReportClickCount({
          likeAmount: clickCount.current,
          alias: item.alias,
        });
      }
      clickCount.current = 0;
    }, 2000);
  };
  const stopTimer = () => {
    clearInterval(timer.current);
    timer.current = undefined;
  };

  const handleIncrese = () => {
    if (disableOperation) return;
    if (increseDomRef.current) {
      const rect = increseDomRef.current.getBoundingClientRect();
      const { top, right } = rect;
      const div = increseIconDomCreate(top, window.innerWidth - right);
      document.body.appendChild(div);
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium');
      setTimeout(() => {
        document.body.removeChild(div);
        // animation duration is 1s
      }, 1100);
    }
    clickCount.current += 1;
    onLikeClick?.();
  };
  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
    };
  }, []);
  const voteAmountIncreseIcon = (
    <img
      src="/images/tg/gold-coin.png"
      className="vote-amount-increse"
      alt="gold coin"
      ref={increseDomRef}
      onClick={handleIncrese}
    />
  );
  return (
    <div className="telegram-vote-item">
      <div className="bg"></div>
      <div className="h-[60px]"></div>
      {!canVote && <Percent percent={item.pointsPercent} />}
      <div
        className={`telegram-vote-item-wrap ${
          canVote ? 'padding-right-large' : 'padding-right-small'
        }`}
        ref={domRef}
      >
        <div className="telegram-vote-item-content truncate">
          <div className={`rank-index-wrap ${isRankIcon ? 'rank-icon' : 'rank-not-icon'}`}>
            {isRankIcon ? (
              <img
                src={`/images/tg/rank-icon-${index}.png`}
                className="vote-item-icon"
                alt="rank-icon"
                width={24}
                height={45}
              />
            ) : (
              <div className="rank-text">
                <span className="title">{index + 1}</span>
                <span className="text">RANK</span>
              </div>
            )}
          </div>
          <div className="vote-game truncate">
            {item.icon ? (
              <img
                src={item.icon}
                alt="rank-icon"
                width={44}
                height={44}
                className="vote-item-rounded"
              />
            ) : (
              <div className="vote-item-rounded vote-item-fake-logo font-17-22">
                {(item.title?.[0] ?? 'T').toUpperCase()}
              </div>
            )}
            <div className="vote-game-content truncate">
              <h3 className="title truncate">{item.title}</h3>
              {item.url ? (
                <p
                  className="show-detail desc sub-title-text truncate select-none"
                  onClick={() => {
                    if (item.screenshots.length > 0 || item.longDescription) {
                      detailDrawerRef.current?.open();
                    } else {
                      setOpen(!open);
                    }
                  }}
                >
                  Show details
                  {open ? <UpOutlined /> : <RightOutlined />}
                </p>
              ) : (
                <p
                  className="desc sub-title-text"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                ></p>
              )}
            </div>
          </div>
        </div>
        {canVote ? (
          <div
            className={`${disableOperation ? 'disabled' : ''} vote-button`}
            onClick={() => {
              if (disableOperation) return;
              onVote?.(item);
            }}
          >
            Vote
          </div>
        ) : (
          <div className="vote-amount-wrap">
            <h3 className="vote-amount font-14-18">{BigNumber(item.pointsAmount).toFormat()}</h3>
            {!disableOperation && (
              <>
                {index === 0 ? (
                  <Tooltip
                    placement="topRight"
                    title={'Tap coin button to earn more points!'}
                    open={isToolTipVisible}
                    overlayClassName="telegram-like-tooltip"
                  >
                    {voteAmountIncreseIcon}
                  </Tooltip>
                ) : (
                  voteAmountIncreseIcon
                )}
              </>
            )}
          </div>
        )}
      </div>
      <div style={{ display: open ? 'block' : 'none' }} className="px-[16px] description-full-wrap">
        {item.description && (
          <p
            className="desc sub-title-text pt-[16px] font-14-18"
            dangerouslySetInnerHTML={{ __html: item.description }}
          ></p>
        )}
        {item?.url && (
          <a href={item?.url} target="_blank" rel="noreferrer" className="">
            <Button type="primary" className="open-button">
              <span className="font-17-22-weight">Open</span>
            </Button>
          </a>
        )}
      </div>
      <CommonDrawer
        title="app details"
        ref={detailDrawerRef}
        showCloseTarget={false}
        showLeftArrow={true}
        bodyClassname="app-detail-drawer"
        headerClassname="app-detail-drawer-header"
        body={
          <div className="">
            <AppDetail item={item} />
          </div>
        }
      />
    </div>
  );
}
