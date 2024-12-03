// src/context/ScrollContext.js
import React, { createContext, MutableRefObject, useContext } from 'react';

type IScrollProviderProps = { children: React.ReactNode; value: any };

export type IScrollContext = {
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  onScroll: () => void;
};

const ScrollContext = createContext<IScrollContext | undefined>(undefined);

export const useScrollContext = () => {
  return useContext(ScrollContext);
};

export const ScrollProvider = ({ children, value }: IScrollProviderProps) => {
  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
};
