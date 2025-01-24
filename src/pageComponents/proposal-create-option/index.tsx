'use client';
import { memo, useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import { useParams } from 'next/navigation';
import OptionListForm from './Form';
import breadCrumb from 'utils/breadCrumb';
import { fetchDaoInfo } from 'api/request';
import { curChain } from 'config';
import { SkeletonForm } from 'components/Skeleton';
import clsx from 'clsx';
import { EOptionType, proposalTypeList } from './type';
import '../proposal-create/index.css';
import 'styles/proposal-create.css';
import { Controller, useForm } from 'react-hook-form';
import FormItem from 'components/FormItem';
import Select from 'components/Select';
import Breads from 'components/Breads';
import Button from 'components/Button';
import { toast } from 'react-toastify';

const ProposalDeploy = () => {
  const { aliasName } = useParams<{ aliasName: string }>();

  const {
    watch,
    control,
    formState: { errors },
    trigger,
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      proposalType: EOptionType.simple,
    },
  });
  useEffect(() => {
    breadCrumb.updateCreateProposalVoteOptionsPage(aliasName);
  }, [aliasName]);
  const [isNext, setNext] = useState(false);
  const { data: daoData } = useRequest(async () => {
    if (!aliasName) {
      toast.error('aliasName is required');
      return null;
    }
    return fetchDaoInfo({ chainId: curChain, alias: aliasName });
  });
  const optionType = watch('proposalType');
  return (
    <>
      <Breads className="mb-[27px] mt-[24px] md:mt-[67px]" />
      <div className="py-[25px] px-[30px] lg:mb-[25px] lg:px-[38px] rounded-[8px] bg-darkBg border-fillBg8 border border-solid">
        {!isNext && (
          <form>
            <FormItem
              label={
                <span className="mb-2 block text-descM15 font-Montserrat text-white">
                  Choose List Type
                </span>
              }
              errorText={errors?.proposalType?.message}
            >
              <Controller
                name="proposalType"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    overlayClassName="!py-3"
                    overlayItemClassName="flex flex-col gap-2 !py-3 text-white text-descM16 font-Montserrat"
                    options={proposalTypeList}
                    isError={!!errors?.proposalType?.message}
                    onChange={(option) => field.onChange(option.value)}
                  />
                )}
              />
            </FormItem>
            <div className="flex justify-end">
              <Button type="primary" onClick={() => setNext(true)}>
                Continue
              </Button>
            </div>
          </form>
        )}
        {isNext && (
          <OptionListForm
            daoId={daoData?.data?.id ?? ''}
            optionType={optionType}
            aliasName={aliasName}
          />
        )}
      </div>
    </>
  );
};

export default memo(ProposalDeploy);
