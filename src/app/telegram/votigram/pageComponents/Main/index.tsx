import { useState } from 'react';
import Assets from '../Assets';
import FootTabBar from '../../components/FootTabBar';
import Task from '../Task';
import Rankings from '../Rankings';
import VoteList from '../VoteList';
import Discover from '../Discover';
import Footer from '../../components/Footer';
import Referral from '../Referral';
import { IStackItem, ITabSource } from '../../type';
import clsx from 'clsx';
import './index.css';

export interface IMainProps {
  onShowMore?: (item: IRankingListResItem) => void;
}

const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.75 6.5C2.75 4.98122 3.98122 3.75 5.5 3.75H18.5C18.9142 3.75 19.25 4.08579 19.25 4.5C19.25 4.91421 18.9142 5.25 18.5 5.25H5.5C4.80964 5.25 4.25 5.80964 4.25 6.5V6.75H18.5C20.0188 6.75 21.25 7.98122 21.25 9.5V17.5C21.25 19.0188 20.0188 20.25 18.5 20.25H5.5C3.98122 20.25 2.75 19.0188 2.75 17.5V6.5ZM4.25 8.25V17.5C4.25 18.1904 4.80964 18.75 5.5 18.75H18.5C19.1904 18.75 19.75 18.1904 19.75 17.5V9.5C19.75 8.80964 19.1904 8.25 18.5 8.25H4.25ZM15.5 14.5C16.0523 14.5 16.5 14.0523 16.5 13.5C16.5 12.9477 16.0523 12.5 15.5 12.5C14.9477 12.5 14.5 12.9477 14.5 13.5C14.5 14.0523 14.9477 14.5 15.5 14.5Z"
      fill="currentColor"
    />
  </svg>
);
export default function Main(props: IMainProps) {
  const [activeTabStack, setActiveTabStack] = useState<IStackItem[]>([{ path: ITabSource.Rank }]);
  const [proposalId, setProposalId] = useState('');
  const [isGold, setIsGold] = useState(false);
  const activeTab = activeTabStack[activeTabStack.length - 1];
  const pushStackByValue = (value: number) => {
    setActiveTabStack([...activeTabStack, { path: value }]);
  };
  const activeTabItem = (item: IStackItem) => {
    setActiveTabStack([...activeTabStack, item]);
  };
  const isNotAssetPage = activeTab.path !== ITabSource.Asset;
  return (
    <div className="relative z-[1]">
      {activeTab.path === ITabSource.Discover && <Discover />}
      {activeTab.path === ITabSource.Rank && (
        <Rankings
          pushStackByValue={pushStackByValue}
          setProposalId={setProposalId}
          setIsGold={setIsGold}
        />
      )}
      {activeTab.path === ITabSource.Vote && (
        <VoteList pushStackByValue={pushStackByValue} proposalId={proposalId} isGold={isGold} />
      )}
      <Task
        style={{
          display: activeTab.path === ITabSource.Task ? 'block' : 'none',
        }}
        show={activeTab.path === ITabSource.Task}
        activeTabItem={activeTabItem}
      />
      {activeTab.path === ITabSource.Referral && <Referral />}
      {activeTab.path === ITabSource.Asset && (
        <Assets
          redirect={false}
          onBack={() => {
            const lastItem = activeTabStack[activeTabStack.length - 2];
            if (lastItem) {
              pushStackByValue(lastItem.path);
            } else {
              pushStackByValue(0);
            }
          }}
        />
      )}
      {isNotAssetPage && typeof document.body !== 'undefined' && (
        <FootTabBar
          value={activeTab.path}
          onChange={(value: number) => {
            pushStackByValue(value);
          }}
        />
      )}
      {isNotAssetPage && typeof document.body !== 'undefined' && (
        <div
          className="wallet-entry-button"
          onClick={() => {
            pushStackByValue(ITabSource.Asset);
          }}
        >
          <WalletIcon />
        </div>
      )}
      {activeTab.path !== ITabSource.Discover && activeTab.path !== ITabSource.Rank && (
        <Footer classname="telegram-votigram-footer-main" />
      )}
    </div>
  );
}
