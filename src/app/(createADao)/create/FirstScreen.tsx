import React from 'react';
import { Button } from 'aelf-design';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';

import { ReactComponent as BaseInfo } from 'assets/revamp-icon/base-info.svg';
import { ReactComponent as Dao } from 'assets/revamp-icon/dao.svg';
import { ReactComponent as HighCouncil } from 'assets/revamp-icon/high-council.svg';
import { ReactComponent as Docs } from 'assets/revamp-icon/docs.svg';
import { ReactComponent as GoStart } from 'assets/revamp-icon/go-start.svg';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

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
    <div className="tmrwdao-grid z-0">
      <div className="col-12 box-border">
        <div className="mt-[67px] mb-[15px] dao-create-first-header">
          <span className="text-lightGrey text-[15px]">TMRW DAO {' > '}</span>
          <span className="text-white text-[14px]">Create a DAO</span>
        </div>
        <div className="dao-create-first-screen mb-[55px] flex items-start lg:items-center justify-between flex-col lg:flex-row">
          <h2 className="dao-create-first-screen-title">Create your DAO on Tomorrow DAO</h2>
          <button onClick={onClickFun} className="login-btn lg:mt-0 mt-[24px]">
            <span>Get Started</span>
            <GoStart />
          </button>
        </div>
        <div className="dao-create-first-screen">
          <ul className="flex dao-create-preview flex-col lg:flex-row">
            <li className="dao-create-preview-item">
              <div className="icon-wrap">
                <BaseInfo />
              </div>
              <p>Step 1</p>
              <h3>Basic Information</h3>
            </li>
            <li className="dao-create-preview-item">
              <div className="icon-wrap">
                <Dao />
              </div>
              <p>Step 2</p>
              <h3>Referendum</h3>
            </li>
            <li className="dao-create-preview-item">
              <div className="icon-wrap">
                <HighCouncil />
              </div>
              <p>Step 3</p>
              <h3>High Council</h3>
            </li>
            <li className="dao-create-preview-item">
              <div className="icon-wrap">
                <Docs />
              </div>
              <p>Step 4</p>
              <h3>Docs</h3>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
