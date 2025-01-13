import React from 'react';

import { ReactComponent as BaseInfo } from 'assets/revamp-icon/base-info.svg';
import { ReactComponent as Dao } from 'assets/revamp-icon/dao.svg';
import { ReactComponent as HighCouncil } from 'assets/revamp-icon/high-council.svg';
import { ReactComponent as Docs } from 'assets/revamp-icon/docs.svg';
import { ReactComponent as GoStart } from 'assets/revamp-icon/go-start.svg';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

import { ReactComponent as ArrowLeft } from 'assets/revamp-icon/arrow-left.svg';
import { ReactComponent as ArrowRight } from 'assets/revamp-icon/arrow-right.svg';

import './index.css';

interface IFirstScreenProps {
  onClick: () => void;
}
export const FirstScreen = (props: IFirstScreenProps) => {
  const { walletInfo: wallet, connectWallet } = useConnectWallet();

  const { onClick } = props;

  const onClickFun = () => {
    if (!wallet?.address) {
      connectWallet();
      return;
    }
    onClick();
  };

  return (
    <div className="dao-steps-wrap">
      <div className="col-12 box-border">
        <div className="md:mt-[47px] lg:mt-[67px] mb-[15px] dao-create-first-header hidden items-center gap-2 md:flex lg:flex">
          <span className="text-lightGrey text-[15px]">TMRW DAO</span>
          <ArrowRight />
          <span className="text-white text-[14px]">Create a DAO</span>
        </div>

        <div className="md:mt-[47px] lg:mt-[67px] mb-[30px] dao-create-first-header flex items-center gap-2 md:hidden lg:hidden">
          <ArrowLeft />
          <span className="text-white text-[14px]">Back</span>
        </div>
        <div className="dao-create-first-screen mb-[30px] md:mb-[55px] lg:mb-[55px] flex items-start lg:items-center md:items-center justify-between flex-col md:flex-row lg:flex-row">
          <div className="dao-create-first-screen-title">Create a DAO with TMRWDAO</div>
          <button onClick={onClickFun} className="login-btn lg:mt-0 mt-[12px] md:mt-0">
            <span>Get Started</span>
            <GoStart />
          </button>
        </div>
        <div className="dao-create-first-screen">
          <ul className="dao-create-preview">
            <li className="dao-create-preview-item">
              <div className="icon-wrap">
                <BaseInfo />
              </div>
              <span className="step">Step 1</span>
              <span className="basic">Basic Information</span>
            </li>
            <li className="dao-create-preview-item">
              <div className="icon-wrap">
                <Dao />
              </div>
              <span className="step">Step 2</span>
              <span className="basic">Referendum</span>
            </li>
            <li className="dao-create-preview-item">
              <div className="icon-wrap">
                <HighCouncil />
              </div>
              <span className="step">Step 3</span>
              <span className="basic">High Council</span>
            </li>
            <li className="dao-create-preview-item">
              <div className="icon-wrap">
                <Docs />
              </div>
              <span className="step">Step 4</span>
              <span className="basic">Docs</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
