// src/context/MyContext.js
import React, { createContext, useContext } from 'react';

type IProps = { children: React.ReactNode; value: any };

const MyContext = createContext(null);

export const useMyContext = () => {
  return useContext(MyContext);
};

export const MyProvider = ({ children, value }: IProps) => {
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};
