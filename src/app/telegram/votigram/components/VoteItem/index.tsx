import { RightOutlined, UpOutlined } from '@aelf-design/icons';
import { Button, Tooltip } from 'antd';
import Percent from './Percent';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';

import './index.css';
import CommonDrawer, { ICommonDrawerRef } from '../CommonDrawer';
import AppDetail from '../AppDetail';
import Image from 'next/image';
import clsx from 'clsx';

export interface ILikeItem {
  likeAmount: number;
  alias: string;
}
interface IVoteItemProps {
  index: number;
  canVote: boolean;
  onVote?: (item: IRankingListResItem) => void;
  onReportClickCount?: (item: ILikeItem) => void;
  item: IRankingListResItem;
  isToolTipVisible?: boolean;
  onLikeClick?: () => void;
  disableOperation?: boolean;
  showVoteAndLike?: boolean;
  showRankIndex?: boolean;
  ingoreShowMoreButtonClick?: boolean;
}
const increseIconDomCreate = (top: number, right: number) => {
  const div = document.createElement('div');
  div.className = 'increment-icon';
  div.innerText = '+1';
  div.style.top = `${top + 4}px`;
  div.style.right = `${right + 4}px`;
  return div;
};
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
    showVoteAndLike = true,
    showRankIndex = true,
    ingoreShowMoreButtonClick = false,
  } = props;
  const isRankIcon = index < 3;
  const domRef = useRef<HTMLDivElement>(null);
  const increseDomRef = useRef<HTMLImageElement>(null);
  const detailDrawerRef = useRef<ICommonDrawerRef>(null);
  const clickCount = useRef(0);
  const timer = useRef<NodeJS.Timer>();
  const [open, setOpen] = useState(false);

  const startTimer = () => {
    timer.current = setInterval(() => {
      if (clickCount.current > 0) {
        onReportClickCount?.({
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

  const handleIncrease = () => {
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
  const needShowMoreButton = useMemo(() => {
    return (
      (item?.screenshots?.length ?? 0) > 0 || item.longDescription || item.description || item.url
    );
  }, [item]);
  const voteAmountIncreseIcon = (
    <img
      src="/images/tg/gold-coin.png"
      className="vote-amount-increse"
      alt="gold coin"
      ref={increseDomRef}
      onClick={handleIncrease}
    />
  );
  return (
    <div className="telegram-vote-item h-[60px]">
      {!canVote && <Percent percent={item.pointsPercent || 0} />}
      <div
        className={`telegram-vote-item-wrap ${
          canVote ? 'padding-right-large' : 'padding-right-small'
        }`}
        ref={domRef}
      >
        <div className="telegram-vote-item-content truncate">
          <div className={`rank-index-wrap ${index ? 'rank-icon' : 'rank-not-icon'}`}>
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
              <Image
                src={item.icon}
                width={44}
                height={44}
                quality={100}
                className="rounded-lg"
                alt=""
              />
            ) : (
              <div className="rounded-lg vote-item-fake-logo font-17-22">
                {(item.title?.[0] ?? 'T').toUpperCase()}
              </div>
            )}
            <div className="vote-game-content truncate">
              <h3 className="title truncate">{item.title}</h3>
              {needShowMoreButton && (
                <p
                  className="show-detail desc sub-title-text truncate select-none"
                  onClick={() => {
                    if (ingoreShowMoreButtonClick) return;
                    if ((item?.screenshots?.length ?? 0) > 0 || item.longDescription) {
                      detailDrawerRef.current?.open();
                    } else {
                      setOpen(!open);
                    }
                  }}
                >
                  Show details
                  {open ? <UpOutlined /> : <RightOutlined />}
                </p>
              )}
            </div>
          </div>
        </div>
        {canVote ? (
          <div
            className={clsx('vote-button', {
              disabled: disableOperation,
            })}
            onClick={() => {
              if (disableOperation) return;
              onVote?.(item);
            }}
          >
            Vote
          </div>
        ) : (
          <div className="vote-amount-wrap">
            <h3 className="vote-amount font-14-18">
              {BigNumber(item.pointsAmount || 0).toFormat()}
            </h3>
            {!disableOperation && (
              <>
                {index === 0 ? (
                  <Tooltip
                    placement="topRight"
                    title="Tap coin button to earn more points!"
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
      <div className={clsx('px-4 description-full-wrap', open ? 'block' : 'hidden')}>
        {item.description && (
          <p
            className="desc sub-title-text pt-4 font-14-18"
            dangerouslySetInnerHTML={{ __html: item.description }}
          ></p>
        )}
        {item?.url && (
          <a href={item?.url} target="_blank" rel="noreferrer">
            <Button type="primary" className="open-button">
              <span className="font-17-22-weight">Open</span>
            </Button>
          </a>
        )}
      </div>
      <CommonDrawer
        ref={detailDrawerRef}
        showCloseTarget={false}
        showCloseIcon={false}
        showLeftArrow
        bodyClassname="app-detail-drawer"
        headerClassname="app-detail-drawer-header"
        body={<AppDetail item={item} />}
      />
    </div>
  );
}
