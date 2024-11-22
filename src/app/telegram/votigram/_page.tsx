'use client';
import { useSearchParams } from 'next/navigation';
import SceneLoading from './pageComponents/Scene/SceneLoading';
import './index.css';
import Slide from './pageComponents/Scene/Slide';
import { useEffect, useState } from 'react';
import Main from './pageComponents/Main';
import Debug from './Debug';
import { VotigramScene } from './const';
import { preloadImages } from 'utils/file';
import { useConfig } from 'components/CmsGlobalConfig/type';
import InvitedSuccess from './pageComponents/InviteedSuccess';
import { getReferrerCode } from './util/start-params';

const imageLists = [
  '/images/tg/circular-progress.png',
  '/images/tg/scene-loading.png',
  '/images/tg/gift.png',
  '/images/tg/rank-icon-0.png',
  '/images/tg/rank-icon-1.png',
  '/images/tg/rank-icon-2.png',
  '/images/tg/vote-list-top-banner-1.png',
  '/images/tg/vote-list-top-banner-2.png',
  '/images/tg/empty-vote-list.png',
  '/images/tg/empty-points.png',
  '/images/tg/refer-banner.png',
  '/images/tg/invite-success-vote-tip.png',
  '/images/tg/smile-emoji-icon.png',
  '/images/tg/gift-icon.png',
  '/images/tg/celebratory-fireworks-icon.png',
  '/images/tg/complete-task.png',
];
const mainPageBgColor = '#090816';
export default function Page() {
  const [scene, setScene] = useState<VotigramScene>(VotigramScene.Loading);
  const searchParams = useSearchParams();

  const isDebug = searchParams.get('debug');
  const { voteMain } = useConfig() ?? {};

  useEffect(() => {
    preloadImages(imageLists);
    preloadImages(voteMain?.topBannerImages ?? []);
  }, []);
  useEffect(() => {
    const webapp = window.Telegram?.WebApp;
    console.log(webapp.expand);
    webapp?.setBackgroundColor(mainPageBgColor);
  }, []);

  const enterMainPage = () => {
    const referrerCode = getReferrerCode();
    if (referrerCode) {
      setScene(VotigramScene.InvitedSuccess);
    } else {
      setScene(VotigramScene.Main);
    }
  };
  useEffect(() => {
    document.body.style.backgroundColor = mainPageBgColor;
    return () => {
      document.body.style.backgroundColor = 'initial';
    };
  }, []);

  return (
    <div className="votigram-wrap">
      <div className="line-bg">
        <div className="star-bg"></div>
      </div>
      {scene === VotigramScene.Loading && (
        <SceneLoading
          onFinish={(isAlreadyClaimed?: boolean) => {
            if (isAlreadyClaimed) {
              enterMainPage();
            } else {
              setScene(VotigramScene.Slide);
            }
          }}
        />
      )}
      {scene === VotigramScene.Slide && (
        <Slide
          onFinish={() => {
            enterMainPage();
          }}
        />
      )}
      {scene === VotigramScene.InvitedSuccess && (
        <InvitedSuccess onFinish={() => setScene(VotigramScene.Main)} />
      )}
      {scene === VotigramScene.Main && <Main />}
      {isDebug && <Debug setScene={setScene} />}
    </div>
  );
}
