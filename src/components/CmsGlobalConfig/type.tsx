'use client';
import { createContext, useContext } from 'react';

export interface IConfigContent {
  loginScreen: {
    title: string;
    subtitle: string;
    progressTips: string[];
  };
  earnScreen: {
    title: string;
    subtitle: string;
  };
  voteMain: {
    rules: {
      title: string;
      description: string[];
    };
    listTitle: string;
    topBannerImages: string[];
    nftImage: string;
  };
}

export const ConfigContext = createContext<IConfigContent | null>(null);

export const useConfig = () => {
  const config = useContext(ConfigContext);
  return config;
};
