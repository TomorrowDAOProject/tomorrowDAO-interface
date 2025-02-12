import React from 'react';
import { TokenIconMap } from 'constants/token';
import './index.css';

interface SymbolProps {
  symbol: string;
  className?: string;
}
export default function Symbol(props: SymbolProps) {
  const { symbol, className } = props;
  return (
    <div className={`${className} token flex items-center gap-1`}>
      {TokenIconMap[symbol] && (
        <img src={TokenIconMap[symbol]} className="token-logo pr-[2px]" alt="" />
      )}
      <span className="font-Montserrat text-desc12 text-lightGrey">{symbol}</span>
    </div>
  );
}
