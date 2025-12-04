import React, { useMemo } from 'react';
import { divDecimals } from 'utils/calculate';
import { numberFormatter } from 'utils/numberFormatter';
import Select, { SelectOption } from 'components/Select';
import Input from 'components/Input';

interface IAmountInputValue {
  amount?: number | null;
  symbol?: string;
}
interface AmountInputProps {
  daoId: string;
  value?: IAmountInputValue;
  onChange?: (value: IAmountInputValue) => void;
  selectOptions: SelectOption[];
  treasuryAssetsData?: ITreasuryAssetsResponseDataItem[];
}
export default function AmountInput(props: AmountInputProps) {
  const { value, onChange, treasuryAssetsData, selectOptions } = props;

  const handleAmountChange = (amount: string) => {
    onChange?.({
      ...value,
      amount: Number(amount) || null,
    });
  };
  const handleSelectChange = ({ value: symbol }: SelectOption) => {
    onChange?.({
      ...value,
      symbol: symbol as string,
    });
  };
  const balance = useMemo(() => {
    const symbolInfo = treasuryAssetsData?.find((item) => item.symbol === value?.symbol);
    if (!symbolInfo) return '-';
    return divDecimals(symbolInfo.amount, symbolInfo.decimal).toFormat();
  }, [treasuryAssetsData, value?.symbol]);

  return (
    <div className="relative border border-solid border-fillBg8 rounded-[8px] h-[95px]">
      <Input
        rootClassName="!border-none"
        placeholder={`Enter amount`}
        regExp={/^([0-9\b]*)$/}
        value={value?.amount?.toString()}
        onChange={handleAmountChange}
      />
      {/* eslint-disable-next-line no-inline-styles/no-inline-styles */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2">
        <Select
          className="w-[166px] !py-[9px]"
          onChange={handleSelectChange}
          value={value?.symbol}
          options={selectOptions}
        />
        <p className="mt-[8px] font-Montserrat text-[11px] leading-[17.6px] text-lightGrey text-right">
          Balance: {numberFormatter(balance)}
        </p>
      </div>
    </div>
  );
}
