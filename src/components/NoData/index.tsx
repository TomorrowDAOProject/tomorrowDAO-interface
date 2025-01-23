import React from 'react';
import { ReactComponent as NoDataIcon } from 'assets/imgs/no-data.svg';

export default function NoData() {
  return (
    <div className="flex flex-col items-center">
      <NoDataIcon />
      <div className="text-lightGrey text-center font-Montserrat text-[12px]">No results found</div>
    </div>
  );
}
