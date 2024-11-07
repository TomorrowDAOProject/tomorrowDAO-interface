import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import CommonDrawer, { ICommonDrawerRef } from '../../components/CommonDrawer';
import { getInviteDetail, getReferrelConfig, getReferrelList } from 'api/request';
import { connectUrl, curChain, networkType, portkeyServer } from 'config';
import qs from 'query-string';
import { getCaHashAndOriginChainIdByWallet } from 'utils/wallet';
import RuleButton from '../../components/RuleButton';
import { useEffect, useRef, useState } from 'react';
import { Button, message, Select } from 'antd';
import QRCode from 'components/QrCode';
import { CopyOutlined, StarOutlined } from '@aelf-design/icons';
import ReferList from './ReferList';
import { useRequest } from 'ahooks';
import BigNumber from 'bignumber.js';
const AElf = require('aelf-sdk');
import './index.css';
import Loading from '../../components/Loading';
import dayjs from 'dayjs';
import ReferralTask from './ReferralTask';
import { useCopyToClipboard } from 'react-use';
import { IStartAppParams } from '../../type';
import { stringifyStartAppParams } from '../../util/start-params';
import CommonModal from 'components/CommonModal';
import { ReactComponent as Vote } from 'assets/icons/vote.svg';
import { ReactComponent as Account } from 'assets/icons/account.svg';

interface ShortLinkResponse {
  shortLink: string;
  userGrowthInfo: {
    caHash: string;
    projectCode: string;
    inviteCode: string;
    shortLinkCode: string;
  };
}
const portkeyConnectTokenUrl = connectUrl + '/connect/token';
const tgLink =
  networkType === 'TESTNET'
    ? 'https://t.me/monkeyTmrwDevBot/Votigram'
    : ' https://t.me/VotigramBot/votigram_web_app';
interface IReferralProps {
  onSuccess?: () => void;
}
export default function Referral(props: IReferralProps) {
  const { walletInfo: wallet, walletType } = useConnectWallet();
  const [currentTimePeriod, setCurrentTimePeriod] = useState('');
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const ruleDrawerRef = useRef<ICommonDrawerRef>(null);
  const shareDrawerRef = useRef<ICommonDrawerRef>(null);
  const listsDrawerRef = useRef<ICommonDrawerRef>(null);
  console.log('wallet', wallet, walletType);

  const { data: inviteDetailRes, loading: inviteDetailLoading } = useRequest(async () => {
    return getInviteDetail({
      chainId: curChain,
    });
  });
  const { data: referrelConfigRes, loading: referrelConfigLoading } = useRequest(async () => {
    return getReferrelConfig({
      chainId: curChain,
    });
  });
  const { data: referrelListRes, loading: referrelListResLoading } = useRequest(async () => {
    return getReferrelList({
      chainId: curChain,
    });
  });
  const {
    data: referrelListQueryRes,
    loading: referrelListQueryLoading,
    run: runReferrelListQuery,
  } = useRequest(
    async (startTime?: number, endTime?: number) => {
      const params: IGetReferrelListReq = {
        chainId: curChain,
      };
      if (startTime) {
        params.startTime = startTime;
      }
      if (endTime) {
        params.endTime = endTime;
      }
      return getReferrelList(params);
    },
    {
      manual: true,
    },
  );
  const generateCode = async () => {
    const timestamp = Date.now();
    const didWallet = wallet?.extraInfo?.portkeyInfo;
    const message = Buffer.from(`${didWallet?.walletInfo.address}-${timestamp}`).toString('hex');
    const signature = AElf.wallet.sign(message, didWallet?.walletInfo.keyPair).toString('hex');
    const publicKey = wallet?.extraInfo?.publicKey ?? '';
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
    const startTime = Number(value.split('-')[0]);
    const endTime = Number(value.split('-')[1]);
    setCurrentTimePeriod(value);
    runReferrelListQuery(startTime, endTime);
  };
  const inviteCode = referralCodeRes?.userGrowthInfo?.inviteCode;
  const startAppParams: IStartAppParams = {
    referralCode: inviteCode,
  };
  const tgLinkWithCode =
    tgLink + (inviteCode ? `?startapp=${stringifyStartAppParams(startAppParams)}` : '');
  const [, setCopied] = useCopyToClipboard();
  const handleCopy = () => {
    setCopied(tgLinkWithCode);
    message.success('Copy success');
  };
  useEffect(() => {
    if (referrelConfigRes) {
      const lists = referrelConfigRes.data.config;
      const first = lists[0];
      if (first) {
        setCurrentTimePeriod(`${first.startTime}-${first.endTime}`);
        runReferrelListQuery(first.startTime, first.endTime);
      }
    }
  }, [referrelConfigRes, runReferrelListQuery]);
  return (
    <div className="referral-wrap">
      <img src="/images/tg/refer-banner.png" className="banner-img" alt="" />
      <RuleButton
        onClick={() => {
          ruleDrawerRef.current?.open();
        }}
        className="rules-wrap"
      />
      <Button onClick={handleInvite} className="invite-btn" type="primary">
        <img
          src="/images/tg/person-add.png"
          alt="person-add"
          width={24}
          height={24}
          className="mr-[10px]"
        />
        <span>Invite Friends</span>
      </Button>
      {/* <div className="referral-task-wrap">
        <img src="/images/tg/refer-task-desc.png" alt="" />
      </div> */}
      <ReferralTask />
      <div className="tg-information-card">
        <div className="top-logo">
          <img src="/images/tg/rectangle-top-border.png" alt="" />
          <h3 className="card-title-text font-16-20-weight">Current Period Records</h3>
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
            <div className="records-title gap-1">
              <Account className="text-[16px] text-white" />
              <span className="font-14-18 ">Account Creation</span>
            </div>
            {inviteDetailRes?.data?.accountCreation}
          </div>
          <div className="border"></div>
          <div className="records-item">
            <div className="records-title gap-1">
              <Vote className="text-[16px] text-white" />
              <span className="font-14-18">Votigram Vote</span>
            </div>
            {BigNumber(inviteDetailRes?.data?.votigramActivityVote ?? 0).toFormat()}
          </div>
        </div>
        <div className="mt-4">
          <Button
            type="primary"
            className="w-full"
            onClick={() => {
              setIsViewAllModalOpen(true);
            }}
          >
            View All Records
          </Button>
        </div>
      </div>
      <div className="tg-information-card">
        <div className="top-logo">
          <img src="/images/tg/rectangle-top-border.png" alt="" />
          <h3 className="card-title-text font-16-20-weight">Leaderboard</h3>
        </div>
        <ReferList
          isShowMore={true}
          onViewMore={() => {
            listsDrawerRef.current?.open();
          }}
          list={(referrelListRes?.data?.data ?? []).slice(0, 10)}
          me={referrelListRes?.data?.me}
          isLoading={referrelListResLoading}
        />
      </div>
      <CommonModal
        open={isViewAllModalOpen}
        title="My Invitation"
        onCancel={() => {
          setIsViewAllModalOpen(false);
        }}
      >
        <div className="flex bg-[#1B1B1B] p-6 mb-2 justify-between rounded-2xl">
          <span className="flex gap-1 items-center">
            <Account className="text-[16px]" />
            Account Creation
          </span>
          <span className="text-[#51FF00] font-semibold">
            {inviteDetailRes?.data.accountCreationAll}
          </span>
        </div>
        <div className="flex bg-[#1B1B1B] p-6 mb-10 justify-between rounded-2xl">
          <span className="flex gap-1 items-center">
            <Vote className="text-[16px]" />
            Votigram Vote
          </span>
          <span className="text-[#51FF00] font-semibold">
            {inviteDetailRes?.data.votigramActivityVoteAll}
          </span>
        </div>
        <Button
          onClick={() => setIsViewAllModalOpen(false)}
          type="primary"
          className="w-full text-[17px] bg-[#5222D8] font-semibold"
        >
          I See
        </Button>
      </CommonModal>

      <CommonDrawer
        title={`Rules`}
        ref={ruleDrawerRef}
        body={
          <div className="flex flex-col items-center">
            <ul className="votigram-rules-text-list">
              <li>
                Invite your friends to sign up on Votigram and after completing a vote on Votigram,
                both of you will earn 50,000 points.
                <br />
                Votigram is a vote-to-earn tool that rewards players with valuable on-chain assets
                and points.
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
                    <p className="link-text break-all">{tgLinkWithCode}</p>
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
        title={`Leaderboard`}
        ref={listsDrawerRef}
        headerClassname="invite-drawer-header"
        bodyClassname="invite-drawer-body-wrap"
        body={
          <div className="invite-drawer-body">
            <Select
              defaultValue=""
              // eslint-disable-next-line no-inline-styles/no-inline-styles
              value={currentTimePeriod}
              // eslint-disable-next-line no-inline-styles/no-inline-styles
              style={{ width: '100%' }}
              popupClassName="invite-drawer-popup"
              onChange={handleChange}
              options={referrelConfigRes?.data.config.map((time) => {
                return {
                  value: `${time.startTime}-${time.endTime}`,
                  label: `${dayjs(time.startTime).format('YYYY/MM/DD')}-${dayjs(
                    time.endTime,
                  ).format('YYYY/MM/DD')}`,
                };
              })}
            />
            <ReferList
              isShowMore={false}
              list={referrelListQueryRes?.data?.data ?? []}
              me={referrelListQueryRes?.data?.me}
              isLoading={referrelListQueryLoading}
            />
          </div>
        }
      />
    </div>
  );
}
