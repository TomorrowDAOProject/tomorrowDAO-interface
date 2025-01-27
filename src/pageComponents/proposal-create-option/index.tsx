'use client';
import { memo, useEffect, useState } from 'react';
import { message, Result, Form } from 'antd';
import { useRequest } from 'ahooks';
import { useParams } from 'next/navigation';
import OptionListForm from './Form';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import breadCrumb from 'utils/breadCrumb';
import { fetchDaoInfo } from 'api/request';
import { curChain } from 'config';
import ProposalType from 'pageComponents/proposal-create/DeployForm/ProposalType';
import { SkeletonForm } from 'components/Skeleton';
import clsx from 'clsx';
import { proposalTypeList } from './type';
import '../proposal-create/index.css';
import 'styles/proposal-create.css';

const ProposalDeploy = () => {
  const { aliasName } = useParams<{ aliasName: string }>();
  const [proposalTypeForm] = Form.useForm();
  useEffect(() => {
    breadCrumb.updateCreateProposalVoteOptionsPage(aliasName);
  }, [aliasName]);
  const [isNext, setNext] = useState(false);
  const {
    data: daoData,
    error: daoError,
    loading: daoLoading,
  } = useRequest(async () => {
    if (!aliasName) {
      message.error('aliasName is required');
      return null;
    }
    return fetchDaoInfo({ chainId: curChain, alias: aliasName });
  });
  const handleNext = () => {
    // const proposalType = form.getFieldValue('proposalType');
    setNext(true);
  };
  const optionType = proposalTypeForm.getFieldValue('proposalType');
  console.log('optionType', optionType);
  return (
    <div>
      <div className="deploy-proposal-options-form-wrap lg:my-[32px] my-[24px]">
        <Form
          form={proposalTypeForm}
          layout="vertical"
          autoComplete="off"
          requiredMark={false}
          scrollToFirstError={true}
        >
          <ProposalType
            className={clsx({ hidden: isNext })}
            next={handleNext}
            options={proposalTypeList}
            titleNode={<h2 className="title-primary mb-[24px]">Choose List Type </h2>}
          />
        </Form>
        {isNext &&
          (daoLoading ? (
            <SkeletonForm />
          ) : (
            <OptionListForm
              daoId={daoData?.data?.id ?? ''}
              optionType={optionType}
              aliasName={aliasName}
            />
          ))}
      </div>
    </div>
  );
};

export default memo(ProposalDeploy);
