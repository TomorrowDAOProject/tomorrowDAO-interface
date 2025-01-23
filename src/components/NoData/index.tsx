import React from 'react';
import Image from 'next/image';
import NoDataIcon from 'assets/imgs/no-data.svg';
type TNoDataType = {
  imgW?: number;
  imgH?: number;
};
export default function NoData(props: TNoDataType) {
  const { imgW = 80, imgH = 80 } = props;
  return (
    <div>
      <Image className="mx-auto block" width={imgW} height={imgH} src={NoDataIcon} alt="" />
      <p className="card-sm-text text-neutralTitle mt-[16px] text-center">No results found</p>
    </div>
  );
}
