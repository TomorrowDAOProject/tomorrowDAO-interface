import React, { useEffect, useState } from 'react';
import { proposalTypeList, proposalStatusList } from '../constants';
import { IProposalTableParams } from '../type';
import Input from 'components/Input';
import Select from 'components/Select';
import { ReactComponent as Search } from 'assets/revamp-icon/search.svg';

type TPropsType = {
  tableParams: IProposalTableParams;
  onChangeTableParams: any;
};

export default function Filter(props: TPropsType) {
  const { onChangeTableParams, tableParams } = props;

  console.log('tableParams', tableParams);
  const [activeType, setActiveType] = useState<any>(proposalTypeList[0]);
  const [activeStatus, setActiveStatus] = useState<any>(proposalStatusList[0]);

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    onChangeTableParams({
      proposalType: activeType.value,
      proposalStatus: activeStatus.value,
      content: inputValue,
    });
  }, [activeType, activeStatus, inputValue]);

  return (
    <div className="flex items-center flex-col xl:flex-row lg:flex-row md:flex-row gap-4">
      <div className="flex items-center w-full gap-4">
        <div className="w-full xl:w-[140px] lg:w-[140px] md:w-[140px]">
          <Select
            className="font-Montserrat h-[36px]"
            value={proposalTypeList[0].value}
            options={proposalTypeList}
            onChange={(value) => {
              setActiveType(value);
            }}
          />
        </div>
        <div className=" w-full xl:w-[140px] lg:w-[140px] md:w-[140px]">
          <Select
            className="font-Montserrat h-[36px]"
            value={proposalStatusList[0].value}
            options={proposalStatusList}
            onChange={(value) => {
              setActiveStatus(value);
            }}
          />
        </div>
      </div>
      <Input
        className="w-full font-Montserrat h-[36px]"
        placeholder="Proposals Title / Description / ID"
        prefix={<Search />}
        maxLength={100}
        onChange={(value) => {
          setInputValue(value);
        }}
      />
    </div>
  );
}
