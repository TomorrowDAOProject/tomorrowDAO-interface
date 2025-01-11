import { Typography, Tooltip } from 'aelf-design';
import './index.css';
import { Form, Radio } from 'antd';
import ChainAddress from 'components/Address';
import { ReactComponent as QuestionIcon } from 'assets/imgs/question-icon.svg';
import { useState } from 'react';
import { cx } from 'antd-style';
import { mediaValidatorMap, useRegisterForm } from '../utils';
import IPFSUpload from 'components/IPFSUpload';
import { EDaoGovernanceMechanism, StepEnum } from '../../type';
import { useSelector } from 'react-redux';
import { dispatch } from 'redux/store';
import { fetchTokenInfo } from 'api/request';
import { setToken } from 'redux/reducer/daoCreate';
import Link from 'next/link';
import FormMembersItem from 'components/FormMembersItem';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

import { curChain } from 'config';
import Input from 'components/Input';
import Textarea from 'components/Textarea';
import FormItem from 'components/FormItem';

export const mediaList = [
  ['metadata', 'socialMedia', 'Twitter'],
  ['metadata', 'socialMedia', 'Facebook'],
  ['metadata', 'socialMedia', 'Telegram'],
  ['metadata', 'socialMedia', 'Discord'],
  ['metadata', 'socialMedia', 'Reddit'],
];

const governanceMechanismNamePath = 'governanceMechanism';
const formMembersListNamePath = ['members', 'value'];
const governanceTokenNamePath = 'governanceToken';

export default function BasicDetails() {
  const [form] = Form.useForm();
  const [mediaError, setMediaError] = useState<boolean>(false);
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  const elfInfo = useSelector((store: any) => store.elfInfo.elfInfo);
  const { walletInfo: wallet } = useConnectWallet();
  const daoType = Form.useWatch(governanceMechanismNamePath, form) ?? EDaoGovernanceMechanism.Token;
  useRegisterForm(form, StepEnum.step0);
  return (
    <div className="basic-detail">
      <div>
        <form>
          <FormItem
            // name={['metadata', 'name']}
            // validateFirst
            // rules={[
            //   {
            //     required: true,
            //     message: 'The name is required',
            //   },
            //   {
            //     type: 'string',
            //     max: 50,
            //     message: 'The name should contain no more than 50 characters.',
            //   },
            // ]}
            label="Name"
          >
            <Input placeholder="Enter a name for the DAO" />
          </FormItem>
          <FormItem
            // name={['metadata', 'logoUrl']}
            // valuePropName="fileList"
            // rules={[
            //   {
            //     required: true,
            //     message: 'Logo is required',
            //   },
            // ]}
            label="Logo"
          >
            <IPFSUpload
              maxFileCount={1}
              needCheckImgSize
              accept=".png,.jpg,.jpeg"
              uploadText="Click to Upload"
              uploadIconColor="#1A1A1A"
              tips="Formats supported: PNG and JPG. Ratio: 1:1 , less than 1 MB."
            />
          </FormItem>
          <FormItem
            // validateFirst
            // rules={[
            //   {
            //     required: true,
            //     message: 'description is required',
            //   },
            //   {
            //     type: 'string',
            //     max: 240,
            //     message: 'The description should contain no more than 240 characters.',
            //   },
            // ]}
            // name={['metadata', 'description']}
            label="Description"
          >
            <Textarea
              rootClassName="Description-textArea"
              maxLength={240}
              value={'description'}
              placeholder={`Enter the mission and vision of the DAO (240 characters max). This can be modified after DAO is created.`}
              onChange={() => console.log('change')}
            />
          </FormItem>
          <FormItem
            className="mb-6"
            // name={['metadata', 'socialMedia', 'title']}
            // dependencies={mediaList}
            // rules={[
            //   ({ getFieldValue }) => ({
            //     validator() {
            //       const metadata = mediaList.map((item) => getFieldValue(item));
            //       const values = Object.values(metadata);
            //       const checked = values.some((item) => item);
            //       if (checked) {
            //         setMediaError(false);
            //         return Promise.resolve();
            //       }
            //       setMediaError(true);
            //       return Promise.reject(new Error(''));
            //     },
            //   }),
            // ]}
            label=""
          >
            <div className="mt-8" id="baseInfo_metadata_socialMedia_title">
              <Typography.Title level={6}>Social Media</Typography.Title>
            </div>
            <div className={cx('Media-info', mediaError && '!text-Reject-Reject')}>
              At least one social media is required.
            </div>
          </FormItem>
          <FormItem
            // name={['metadata', 'socialMedia', 'Twitter']}
            // validateFirst
            // rules={[
            //   ...mediaValidatorMap.Twitter.validator,
            //   {
            //     type: 'string',
            //     max: 16,
            //     message: 'The X (Twitter) user name should be shorter than 15 characters.',
            //   },
            // ]}
            label="X (Twitter)"
          >
            <Input placeholder={`Enter the DAO's X handle, starting with @`} />
          </FormItem>
          <FormItem
            // name={['metadata', 'socialMedia', 'Facebook']}
            // validateFirst
            // rules={[
            //   ...mediaValidatorMap.Other.validator,
            //   {
            //     type: 'string',
            //     max: 128,
            //     message: 'The URL should be shorter than 128 characters.',
            //   },
            // ]}
            label="Facebook"
          >
            <Input placeholder={`Enter the DAO's Facebook link`} />
          </FormItem>
          <FormItem
            // name={['metadata', 'socialMedia', 'Discord']}
            // validateFirst
            // rules={[
            //   ...mediaValidatorMap.Other.validator,
            //   {
            //     type: 'string',
            //     max: 128,
            //     message: 'The URL should be shorter than 128 characters.',
            //   },
            // ]}
            label="Discord"
          >
            <Input placeholder={`Enter the DAO's Discord community link`} />
          </FormItem>
          <FormItem
            // name={['metadata', 'socialMedia', 'Telegram']}
            // validateFirst
            // rules={[
            //   ...mediaValidatorMap.Other.validator,
            //   {
            //     type: 'string',
            //     max: 128,
            //     message: 'The URL should be shorter than 128 characters.',
            //   },
            // ]}
            label="Telegram"
          >
            <Input placeholder={`Enter the DAO's Telegram community link`} />
          </FormItem>
          <FormItem
            // name={['metadata', 'socialMedia', 'Reddit']}
            // validateFirst
            // rules={[
            //   ...mediaValidatorMap.Other.validator,
            //   {
            //     type: 'string',
            //     max: 128,
            //     message: 'The URL should be shorter than 128 characters.',
            //   },
            // ]}
            label="Reddit"
          >
            <Input placeholder={`Enter the DAO's subreddit link`} />
          </FormItem>
          <div className="mb-6 pt-8">
            <span className="card-title">DAO&apos;s Metadata Admin</span>
          </div>
          <div className="mb-8">
            <ChainAddress
              size="large"
              address={walletInfo.address}
              chain={elfInfo.curChain}
              info="The DAO's metadata admin can modify certain info about the DAO, such as its description, logo, social media, documents, etc."
            />
          </div>
          <div className={cx('symbol-radio')}>
            <span className="form-item-title">Governance Participants</span>
            <div className="dao-type-tip">Who can participate in governance ?</div>
          </div>
          <FormItem
            // name={governanceMechanismNamePath}
            required
            // initialValue={EDaoGovernanceMechanism.Token}
          >
            <Radio.Group className="dao-type-select">
              <div className="dao-type-select-item">
                <Radio
                  value={EDaoGovernanceMechanism.Token}
                  onClick={() => {
                    if (daoType === EDaoGovernanceMechanism.Token) {
                      return;
                    }
                    form.setFieldValue(governanceTokenNamePath, '');
                  }}
                  className="dao-type-select-radio"
                >
                  <span className="text-[16px] leading-[24px]">Token holders</span>
                </Radio>
              </div>
              <div className="dao-type-select-item">
                <Radio
                  value={EDaoGovernanceMechanism.Multisig}
                  className="dao-type-select-radio"
                  onClick={() => {
                    if (daoType === EDaoGovernanceMechanism.Multisig) {
                      return;
                    }
                    form.setFieldValue(formMembersListNamePath, [
                      `ELF_${wallet?.address}_${curChain}`,
                    ]);
                  }}
                >
                  <span className="text-[16px] leading-[24px]">Multisig Members </span>
                </Radio>
              </div>
            </Radio.Group>
          </FormItem>
          {daoType === EDaoGovernanceMechanism.Token && (
            <>
              <div>
                <Tooltip
                  title={
                    <div>
                      <div>
                        Using a governance token is essential for enabling the High Council and
                        facilitating additional voting mechanisms.
                      </div>
                      <div>
                        1. If the High Council is to be enabled, its members are elected from
                        top-ranked addresses who stake governance tokens and receive votes.
                      </div>
                      <div>
                        2. If a governance token is not used, only one type of proposal voting
                        mechanism is supported: &quot;1 address = 1 vote&quot;. With the governance
                        token enabled, DAOs can support an additional mechanism: &quot;1 token = 1
                        vote&quot;. You can choose the voting mechanism when you create proposals.
                      </div>
                    </div>
                  }
                >
                  <span className="flex items-center form-item-title gap-[8px] pb-[8px] w-[max-content]">
                    Governance Token
                    <QuestionIcon className="cursor-pointer " width={16} height={16} />
                  </span>
                </Tooltip>
              </div>
              <FormItem
                // validateFirst
                // rules={[
                //   {
                //     required: true,
                //     message: 'governance_token is required',
                //   },
                //   {
                //     validator: (_, value) => {
                //       const reqParams = {
                //         symbol: value ?? '',
                //         chainId: elfInfo.curChain,
                //       };
                //       return new Promise<void>((resolve, reject) => {
                //         fetchTokenInfo(reqParams)
                //           .then((res) => {
                //             dispatch(setToken(res.data));
                //             if (!res.data.name) {
                //               reject(new Error('The token has not yet been issued'));
                //             }
                //             resolve();
                //           })
                //           .catch(() => {
                //             reject(new Error('The token has not yet been issued.'));
                //           });
                //       });
                //     },
                //   },
                // ]}
                // validateTrigger="onBlur"
                // name={governanceTokenNamePath}
                label=""
                className="governance-token-item"
              >
                <Input
                  placeholder="Enter a token symbol"
                  onBlur={() => {
                    const token = form.getFieldValue('governanceToken');
                    form.setFieldValue('governanceToken', token?.toUpperCase());
                  }}
                />
              </FormItem>
              <div className="mb-[20px] ">
                <Link
                  href="https://medium.com/@NFT_Forest_NFT/tutorial-how-to-buy-seeds-and-create-tokens-on-symbol-market-de3aa948bcb4"
                  target="_blank"
                >
                  <span className="text-[14px] leading-[20px] text-colorPrimary">
                    How to create a token?
                  </span>
                </Link>
              </div>
            </>
          )}
          {daoType === EDaoGovernanceMechanism.Multisig && (
            <>
              <FormMembersItem
                name={formMembersListNamePath}
                initialValue={[`ELF_${wallet?.address}_${curChain}`]}
                form={form}
              />
            </>
          )}
        </form>
      </div>
    </div>
  );
}
