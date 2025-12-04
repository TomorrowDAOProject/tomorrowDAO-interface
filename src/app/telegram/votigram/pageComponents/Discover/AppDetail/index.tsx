import { Button } from 'aelf-design';
import { Tag } from 'antd';
import { DailyTaskIcon, DiscussionIcon } from 'components/Icons';
import Discussion from '../Discussion';
import './index.css';
import { useState } from 'react';
import BigNumber from 'bignumber.js';

interface IAppDetailProps {
  item: IDiscoverAppItem | null;
  style?: React.CSSProperties;
  className?: string;
}
export default function AppDetail(props: IAppDetailProps) {
  const { style, className, item } = props;
  const [total, setTotal] = useState(0);
  const handleScrollToDiscussion = () => {
    const dom = document.querySelector('#discussion');
    dom?.scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
    });
  };
  return (
    <div className={`${className} discover-app-detail-wrap`} style={style}>
      <div className="summary">
        <img className="summary-logo" src={item?.icon} alt="" />
        <div className="summary-desc">
          <h3 className="font-20-28-weight text-white">{item?.title}</h3>
          <div className="app-detail-wrap-tags my-[2px]">
            {item?.categories?.map((category, index) => (
              <Tag key={index}>{category}</Tag>
            ))}
          </div>
        </div>
      </div>
      {item?.description && (
        <p
          className="font-14-20 text-[#9A9A9A] summary-desc-text px-[16px] mt-[32px]"
          dangerouslySetInnerHTML={{
            __html: item?.description ?? '',
          }}
        ></p>
      )}

      <div className="statistics-data">
        <div className="app-discussion-wrap item">
          <h3 className="font-14-20" onClick={handleScrollToDiscussion}>
            <DiscussionIcon />
            Discussion
          </h3>
          {total === 0 ? (
            <span className="font-12-28-weight text-white">Waiting for you</span>
          ) : (
            <span className="font-20-28-weight text-[#FFF]">{BigNumber(total).toFormat()}</span>
          )}
        </div>
        <div className="voting-points item">
          <h3 className="font-14-20">
            <DailyTaskIcon />
            Voting Points
          </h3>
          {item?.totalPoints === 0 ? (
            <span className="font-12-28-weight text-white">No rating yet</span>
          ) : (
            <span className="font-20-28-weight text-[#51FF00]">
              {BigNumber(item?.totalPoints ?? 0).toFormat()}
            </span>
          )}
        </div>
      </div>
      <div className="app-link">
        <a href={item?.url}>
          <Button type="primary">
            <span className="font-16-24-weight app-link-text">Open</span>
          </Button>
        </a>
      </div>
      <div>
        {(item?.screenshots?.length ?? 0) > 0 && (
          <ul className="app-screenshots mt-[24px]">
            {item?.screenshots?.map((screenshot, index) => (
              <li key={index}>
                <img src={screenshot} alt="" />
              </li>
            ))}
          </ul>
        )}
      </div>
      {item?.longDescription && (
        <div className="description-wrap mt-[32px] px-[16px]">
          <h3 className="font-20-28-weight text-white">Description</h3>
          <p className="font-14-20 mt-[8px] text-[#E0E0E0]">{item?.longDescription}</p>
        </div>
      )}
      <div className="mt-[32px] px-[16px]">
        <Discussion
          alias={item?.alias ?? ''}
          onTotalChange={(num) => {
            setTotal(num);
          }}
          total={total}
        />
      </div>
    </div>
  );
}
