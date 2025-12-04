'use client';
import { Button } from 'aelf-design';
import { RightOutlined } from '@aelf-design/icons';
import { voteApps, voteApps1, voteApps2 } from './config';
import { networkType } from 'config';
import './index.css';

const renderApps = [voteApps, voteApps1, voteApps2];
export default function Votigram() {
  return (
    <div className="votigram-intro-container">
      <h2 className="votigram-intro-title">Votigram</h2>
      <div className="votigram-intro-desc">
        <p>
          Votigram is a Telegram Bot that allows users to vote for their preferred options and get
          incentivized for casting their votes.
        </p>
        <p>
          In Votigram, users get to earn rewards by voting. Voting allows them to earn and
          accumulate points, which can be exchanged for token rewards.
        </p>
      </div>
      <a
        href={
          networkType === 'TESTNET' ? 'https://t.me/monkeyTmrwDevBot' : 'https://t.me/VotigramBot'
        }
        target="_blank"
        rel="noreferrer"
        className="votigram-intro-button-container"
      >
        <Button type="primary" className="votigram-intro-button">
          <svg
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.31274 9.03997C7.78665 7.09076 10.77 5.80572 12.2627 5.18485C16.5247 3.41215 17.4103 3.10421 17.9875 3.09404C18.1144 3.09181 18.3983 3.12327 18.5822 3.27247C18.7374 3.39845 18.7801 3.56863 18.8006 3.68808C18.821 3.80752 18.8465 4.07962 18.8263 4.29223C18.5953 6.71893 17.5959 12.6079 17.0875 15.3258C16.8724 16.4759 16.4488 16.8615 16.0387 16.8992C15.1475 16.9812 14.4707 16.3102 13.6076 15.7444C12.2568 14.859 11.4938 14.3078 10.1826 13.4438C8.66744 12.4453 9.64969 11.8965 10.5132 10.9996C10.7392 10.7649 14.6659 7.19327 14.7419 6.86926C14.7514 6.82874 14.7603 6.67769 14.6705 6.59793C14.5808 6.51817 14.4483 6.54545 14.3528 6.56714C14.2173 6.59789 12.0595 8.02411 7.87938 10.8458C7.2669 11.2664 6.71213 11.4713 6.21508 11.4606C5.66711 11.4487 4.61306 11.1507 3.82947 10.896C2.86838 10.5836 2.10451 10.4184 2.17103 9.88786C2.20568 9.6115 2.58624 9.32887 3.31274 9.03997Z"
              fill="white"
            />
          </svg>
          Open Votigram
        </Button>
      </a>
      <div className="votigram-intro-apps">
        {renderApps.map((apps, index) => (
          <div
            key={index}
            className={`${
              index === 1 ? 'left-direction' : 'right-direction'
            } votigram-intro-apps-row`}
            style={{ '--time': '100s' } as React.CSSProperties}
          >
            <div className="scroll-1">
              {apps.map((app) => (
                <div className="votigram-intro-item" key={app.id}>
                  <div className="content">
                    <img src={app.icon} alt="" />
                    <div>
                      <h3 className="title">{app.title}</h3>
                      <div className="votigram-intro-item-details ">
                        <span className="text">Show details</span>
                        <RightOutlined />
                      </div>
                    </div>
                  </div>
                  <div className="vote-button">Vote</div>
                </div>
              ))}
            </div>
            <div className="scroll-2">
              {apps.map((app) => (
                <div className="votigram-intro-item " key={app.id}>
                  <div className="content">
                    <img src={app.icon} alt="" />
                    <div>
                      <h3 className="title">{app.title}</h3>
                      <div className="votigram-intro-item-details ">
                        <span className="text">Show details</span>
                        <RightOutlined />
                      </div>
                    </div>
                  </div>
                  <div className="vote-button">Vote</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="phone-screen">
          <img className="phone-shell" src="/images/web/phone-shell.png" alt="" />
          <img className="phone-content" src="/images/web/phone-screen-shot.png" alt="" />
        </div>
      </div>
    </div>
  );
}
