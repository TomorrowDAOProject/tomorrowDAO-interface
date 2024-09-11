import { useWebLogin } from 'aelf-web-login';
import CommonDrawer, { ICommonDrawerRef } from '../CommonDrawer';
import { getInviteDetail, getReferrelList } from 'api/request';
import { connectUrl, curChain, networkType, portkeyServer } from 'config';
import qs from 'query-string';
import { getCaHashAndOriginChainIdByWallet } from 'utils/wallet';
import RuleButton from '../RuleButton';
import { useRef } from 'react';
import { Button, message, Select } from 'antd';
import QRCode from 'components/QrCode';
import { CopyOutlined, StarOutlined } from '@aelf-design/icons';
import ReferList from './ReferList';
import { useRequest } from 'ahooks';
import BigNumber from 'bignumber.js';
const AElf = require('aelf-sdk');
import './index.css';
import Loading from '../Loading';

interface ShortLinkResponse {
  shortLink: string;
  userGrowthInfo: {
    caHash: string;
    projectCode: string;
    inviteCode: string;
    shortLinkCode: string;
  };
}
const portkeyConnectTokenUrl =
  networkType === 'TESTNET'
    ? connectUrl + '/connect/token'
    : 'https://referral.portkey.finance/connect/token';
const tgLink =
  networkType === 'TESTNET'
    ? 'https://t.me/monkeyTmrwDevBot/Votigram'
    : ' https://t.me/VotigramBot/votigram_web_app';
interface IReferralProps {
  onSuccess?: () => void;
}
export default function Referral(props: IReferralProps) {
  const { wallet, walletType } = useWebLogin();
  console.log('wallet', wallet);
  const ruleDrawerRef = useRef<ICommonDrawerRef>(null);
  const shareDrawerRef = useRef<ICommonDrawerRef>(null);
  const listsDrawerRef = useRef<ICommonDrawerRef>(null);
  console.log('wallet', wallet, walletType);

  const { data: inviteDetailRes, loading: inviteDetailLoading } = useRequest(async () => {
    return getInviteDetail({
      chainId: curChain,
    });
  });
  const { data: referrelListRes, loading } = useRequest(async () => {
    return getReferrelList({
      chainId: curChain,
    });
  });
  const {
    data: referrelListQueryRes,
    loading: referrelListQueryLoading,
    run: runReferrelListQuery,
  } = useRequest(
    async (startTime: string, endTime: string) => {
      return getReferrelList({
        startTime,
        endTime,
        chainId: curChain,
      });
    },
    {
      manual: true,
    },
  );
  const generateCode = async () => {
    const timestamp = Date.now();
    const didWallet = wallet.portkeyInfo;
    const message = Buffer.from(`${didWallet?.walletInfo.address}-${timestamp}`).toString('hex');
    const signature = AElf.wallet.sign(message, didWallet?.walletInfo.keyPair).toString('hex');
    const publicKey = wallet.publicKey ?? '';
    const { caHash } = await getCaHashAndOriginChainIdByWallet(wallet, walletType);
    const requestObject = {
      grant_type: 'signature',
      client_id: 'CAServer_App',
      scope: 'CAServer',
      signature: signature,
      pubkey: publicKey,
      timestamp: timestamp,
      ca_hash: caHash,
      chain_id: curChain,
    };
    const portKeyRes = await fetch(portkeyConnectTokenUrl, {
      method: 'POST',
      body: qs.stringify(requestObject),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const portKeyResObj = await portKeyRes.json();
    if (portKeyRes.ok) {
      const token = portKeyResObj.access_token;
      const res = await fetch(portkeyServer + '/api/app/growth/shortLink?projectCode=13027', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resObj = await res.json();
      if (res.ok) {
        return resObj as ShortLinkResponse;
      }
      console.log(res);
    }
    return null;
  };
  const { data: referralCodeRes, loading: referralCodeResLoading } = useRequest(async () => {
    return generateCode();
  });
  const handleInvite = async () => {
    shareDrawerRef.current?.open();
  };

  const handleChange = (value: string) => {
    console.log('value', value);
    runReferrelListQuery(value.split('-')[0], value.split('-')[1]);
  };
  const inviteCode = referralCodeRes?.userGrowthInfo?.inviteCode;
  const tgLinkWithCode = tgLink + (inviteCode ? `?startapp=${inviteCode}` : '');
  const handleCopy = () => {
    navigator.clipboard
      .writeText(tgLinkWithCode)
      .then(() => {
        message.success('Copy success');
      })
      .catch(() => {
        message.error('Copy failed');
      });
  };
  return (
    <div className="referral-wrap">
      <RuleButton
        onClick={() => {
          ruleDrawerRef.current?.open();
        }}
        className="rules-wrap"
      />
      <Button onClick={handleInvite} className="invite-btn">
        <img
          src="/images/tg/person-add.png"
          alt="person-add"
          width={24}
          height={24}
          className="mr-[10px]"
        />
        <span>Invite Friends</span>
      </Button>
      <div className="referral-task-wrap">
        <img src="/images/tg/refer-task-desc.png" alt="" />
      </div>
      <div className="tg-information-card">
        <div className="top-logo">
          <img src="/images/tg/rectangle-top-border.png" alt="" />
          <h3 className="card-title-text font-16-20-weight">Invitation Records</h3>
        </div>
        <div className="reward">
          <div className="reward-title">
            <StarOutlined />
            <span className="font-14-18 ml-[4px]">Estimated Reward</span>
          </div>
          <p className="reward-num font-24-32-weight">
            {BigNumber(inviteDetailRes?.data?.estimatedReward ?? 0).toFormat()}
          </p>
        </div>
        <div className="records">
          <div className="records-item">
            <div className="records-title">
              <img src="/images/tg/account-icon.png" alt="" />
              <span className="font-14-18 ">Account Creation</span>
            </div>
            {inviteDetailRes?.data?.accountCreation}
          </div>
          <div className="border"></div>
          <div className="records-item">
            <div className="records-title">
              <img src="/images/tg/vote-icon.png" alt="" />
              <span className="font-14-18">Votigram Vote</span>
            </div>
            {inviteDetailRes?.data?.votigramVote}
          </div>
        </div>
      </div>
      <div className="tg-information-card">
        <div className="top-logo">
          <img src="/images/tg/rectangle-top-border.png" alt="" />
          <h3 className="card-title-text font-16-20-weight">Leaderboard</h3>
        </div>
        <ReferList
          isShowMore={(referrelListRes?.data?.list ?? []).length > 10}
          onViewMore={() => {
            listsDrawerRef.current?.open();
          }}
          list={referrelListRes?.data?.list ?? []}
          meRank={0}
          meInviteeCount={inviteDetailRes?.data?.accountCreation ?? 0}
        />
      </div>
      <CommonDrawer
        title={`Rules`}
        ref={ruleDrawerRef}
        body={
          <div className="flex flex-col items-center">
            <ul className="votigram-rules-text-list">
              <li>
                Invite your friends to create a Portkey account and after completing a vote on
                Votigram, both of you will earn 50,000 points Votigram is a vote-to-earn tool that
                rewards players with valuable on-chain assets and points.
              </li>
              <li>
                Your friend&apos;s account must be created during the event period. Once they
                complete a vote during the event, both of you will qualify for referral rewards.
              </li>
              <li>The top 10 inviters will win 100,000 points each after the event ends.</li>
              <li>All rewards will be distributed after the event concludes.</li>
              <li>
                Users may lose their eligibility for rewards in the event of cheating or other
                malicious actions.
              </li>
            </ul>
            <Button
              type="primary"
              onClick={() => {
                ruleDrawerRef.current?.close();
              }}
            >
              Got it
            </Button>
          </div>
        }
      />
      <CommonDrawer
        title={`Share`}
        ref={shareDrawerRef}
        body={
          <div className="flex flex-col items-center">
            {referralCodeResLoading ? (
              <Loading />
            ) : (
              <>
                <div>
                  <QRCode value={tgLinkWithCode} size={132} quietZone={6} ecLevel="H" />
                </div>
                <div className="referral-link-wrap">
                  <h2 className="font-16-20-weight">Referral Link</h2>
                  <div className="font-14-18 link">
                    <p className="link-text">{tgLinkWithCode}</p>
                    <div className="copy-button" onClick={handleCopy}>
                      <CopyOutlined />
                    </div>
                  </div>
                </div>
                <Button
                  type="primary"
                  onClick={() => {
                    if (window?.Telegram?.WebApp?.openTelegramLink) {
                      window?.Telegram?.WebApp?.openTelegramLink(
                        `https://t.me/share/url?url=${tgLinkWithCode}`,
                      );
                    }
                  }}
                >
                  Share
                </Button>
              </>
            )}
          </div>
        }
      />
      <CommonDrawer
        title={`123`}
        ref={listsDrawerRef}
        headerClassname="invite-drawer-header"
        bodyClassname="invite-drawer-body-wrap"
        body={
          <div className="invite-drawer-body">
            <Select
              defaultValue="2024/09/11-2024/09/12"
              // eslint-disable-next-line no-inline-styles/no-inline-styles
              style={{ width: '100%' }}
              popupClassName="invite-drawer-popup"
              onChange={handleChange}
              options={[
                { value: '2024/09/11-2024/09/12', label: '2024/09/11-2024/09/12' },
                { value: '2024/09/13-2024/09/14', label: '2024/09/13-2024/09/14' },
              ]}
            />
            <ReferList
              isShowMore={false}
              list={referrelListQueryRes?.data?.list ?? []}
              meRank={0}
              meInviteeCount={inviteDetailRes?.data?.accountCreation ?? 0}
            />
          </div>
        }
      />
    </div>
  );
}