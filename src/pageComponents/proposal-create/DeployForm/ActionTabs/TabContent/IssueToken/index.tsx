import { Controller } from 'react-hook-form';
import { fetchTokenIssue } from 'api/request';
import { curChain } from 'config';
import { divDecimals, timesDecimals } from 'utils/calculate';
import BigNumber from 'bignumber.js';
import FormItem from 'components/FormItem';
import Input from 'components/Input';
import './index.css';
import Text from 'components/Text';
interface IIssueTokenProps {
  form: any;
}

export default function IssueToken(props: IIssueTokenProps) {
  const { form } = props;
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const schemeAddress = watch('proposalBasicInfo.schemeAddress');

  return (
    <>
      <div className="mb-[30px] flex flex-col items-start lg:flex-row lg:items-center justify-between gap-4">
        <span className="whitespace-nowrap text-descM16 font-Montserrat text-white">Organisation address:</span>
        {schemeAddress && <Text content={`ELF_${schemeAddress}_${curChain}`} copyable />}
      </div>

      <FormItem
        label="Symbol"
        className="!mb-[30px]"
        errorText={errors?.issueObj?.symbol?.message}
      >
        <Controller
          name="issueObj.symbol"
          control={control}
          rules={{
            required: 'Please enter symbol',
            validate: {
              format: (value) => {
                const reg = /^[A-Za-z0-9-]{1,20}$/;
                if (!reg.test(value)) {
                  return 'Symbol name is invalid';
                }
                return true;
              },
              validateSymbol: async (value) => {
                try {
                  const res = await fetchTokenIssue({
                    symbol: value.toUpperCase(),
                    chainId: curChain,
                  });
                  
                  if (!res?.data?.totalSupply) {
                    return 'The token has not yet been created';
                  }
                  if (!res?.data?.realIssuers?.includes(schemeAddress)) {
                    return 'The symbol cannot be issued by the organisation address';
                  }
                  
                  setValue('issueObj.decimals', res?.data?.decimals);
                  return true;
                } catch {
                  return 'Query token error';
                }
              }
            }
          }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Please enter the symbol you want to issue"
              onBlur={(value) => {
                field.onChange(value.toUpperCase());
              }}
            />
          )}
        />
      </FormItem>

      <FormItem
        label="Amount"
        className="!mb-[30px]"
        errorText={errors?.issueObj?.amount?.message}
      >
        <Controller
          name="issueObj.amount"
          control={control}
          rules={{
            required: 'The amount is required',
            validate: {
              positive: (value) => {
                if (BigNumber(value).lte(0)) {
                  return 'The amount must be greater than 0';
                }
                return true;
              },
              validateAmount: async (value) => {
                const symbol = watch('issueObj.symbol');
                if (!symbol) {
                  return 'Please enter symbol';
                }

                try {
                  const res = await fetchTokenIssue({
                    symbol: symbol.toUpperCase(),
                    chainId: curChain,
                  });
                  
                  const { totalSupply, decimals, supply } = res?.data ?? {};
                  if (!decimals || !totalSupply || !supply) {
                    return 'Please enter a valid symbol';
                  }

                  const inputAmount = timesDecimals(value, decimals);
                  const decimalPlaces = BigNumber(value).decimalPlaces();
                  if (decimalPlaces && decimalPlaces > decimals) {
                    return `The maximum number of decimal places is ${decimals}`;
                  }

                  const inputTotal = BigNumber(totalSupply - supply);
                  if (inputTotal.lt(inputAmount)) {
                    return `The maximum amount that can be issued: ${divDecimals(
                      inputTotal,
                      decimals,
                    ).toFormat()}`;
                  }

                  return true;
                } catch {
                  return 'Get token info error';
                }
              }
            }
          }}
          render={({ field }) => (
            <Input
              {...field}
              regExp={/^[0-9]*$/}
              placeholder="Please enter the amount you want to issue"
            />
          )}
        />
      </FormItem>

      <FormItem
        label="Issue To"
        className="!mb-[30px]"
        errorText={errors?.issueObj?.to?.message}
      >
        <Controller
          name="issueObj.to"
          control={control}
          rules={{
            required: 'The address is required',
            validate: {
              validAddress: (value) => {
                if (value.endsWith('AELF')) {
                  return 'Please enter a valid address';
                }
                if (!value.startsWith('ELF') || !value.endsWith(curChain)) {
                  return 'Please enter a valid address';
                }
                return true;
              }
            }
          }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={`Enter ELF_..._${curChain}`}
            />
          )}
        />
      </FormItem>
    </>
  );
}
