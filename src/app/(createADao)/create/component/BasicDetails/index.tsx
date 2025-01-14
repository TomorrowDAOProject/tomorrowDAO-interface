import './index.css';
import { Form } from 'antd';
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
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

import { curChain } from 'config';
import Input from 'components/Input';
import Textarea from 'components/Textarea';
import FormItem from 'components/FormItem';
import Upload from 'components/Upload';
import Radio from 'components/Radio';
import Tooltip from 'components/Tooltip';
import LinkGroup from '../LinkGroup';

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
  const { watch, control, handleSubmit } = useForm();
  const [form] = Form.useForm();
  const [mediaData, setMediaData] = useState([{ name: '', value: '' }]);
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  const elfInfo = useSelector((store: any) => store.elfInfo.elfInfo);
  const { walletInfo: wallet } = useConnectWallet();
  const daoType = watch(governanceMechanismNamePath) ?? EDaoGovernanceMechanism.Multisig;
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
          <div className="flex flex-col md:flex-row">
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
              <Upload
                className="mx-auto !w-[250px]"
                needCheckImgSize
                uploadText="Upload"
                tips={`Formats supported: PNG and JPG.\n Ratio: 1:1 , less than 1 MB.`}
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
              className="md:ml-[50px] md:flex-grow"
            >
              <Textarea
                rootClassName="md:h-[250px]"
                maxLength={240}
                value={'description'}
                placeholder={`Enter the mission and vision of the DAO (240 characters max). This can be modified after DAO is created.`}
                onChange={() => console.log('change')}
              />
            </FormItem>
          </div>
          <div className="mb-[25px]">
            <span className="mb-2 block font-Montserrat text-descM16 text-white">Links</span>
            <span className="font-desc13 font-Montserrat text-white">
              Links to your DAO&apos;s website, social media profiles, discord, or other places your
              community gathers.
            </span>
          </div>

          <Controller
            name="checkbox"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <LinkGroup links={mediaData} {...field} />}
          />

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
          <div className="mb-[15px]">
            <span className="text-descM16 font-Montserrat text-white">
              DAO&apos;s Metadata Admin
            </span>
          </div>
          <div className="mb-8">
            <ChainAddress
              size="large"
              address={walletInfo.address}
              chain={elfInfo.curChain}
              info="The DAO's metadata admin can modify certain info about the DAO, such as its description, logo, social media, documents, etc."
            />
          </div>
          <FormItem
            label={
              <>
                <span className="mb-2 block text-descM15 font-Montserrat text-white">
                  Governance Participants
                </span>
                <div className="mb-[10px] text-desc13 font-Montserrat text-lightGrey">
                  Who can participate in governance ?
                </div>
              </>
            }
            // name={governanceMechanismNamePath}
            // initialValue={EDaoGovernanceMechanism.Token}
          >
            <Controller
              name={governanceMechanismNamePath}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Radio
                  options={[
                    { label: 'Token holders', value: EDaoGovernanceMechanism.Token },
                    { label: 'Multisig Members', value: EDaoGovernanceMechanism.Multisig },
                  ]}
                  {...field}
                />
              )}
            />
            {/* <Radio.Group className="dao-type-select">
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
            </Radio.Group> */}
          </FormItem>
          {daoType === EDaoGovernanceMechanism.Token && (
            <>
              <FormItem
                label={
                  <Tooltip
                    title={
                      <>
                        <p className="!mb-4 text-[10px] leading-[12px] font-Montserrat font-medium text-lightGrey">
                          Using a governance token is essential for enabling the High Council and
                          facilitating additional voting mechanisms.
                        </p>
                        <p className="!mb-4 text-[10px] leading-[12px] font-Montserrat font-medium text-lightGrey">
                          1. If the High Council is to be enabled, its members are elected from
                          top-ranked addresses who stake governance tokens and receive votes.
                        </p>
                        <p className="text-[10px] leading-[12px] font-Montserrat font-medium text-lightGrey">
                          2. If a governance token is not used, only one type of proposal voting
                          mechanism is supported: &quot;1 address = 1 vote&quot;. With the
                          governance token enabled, DAOs can support an additional mechanism:
                          &quot;1 token = 1 vote&quot;. You can choose the voting mechanism when you
                          create proposals.
                        </p>
                      </>
                    }
                  >
                    <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
                      Governance Token
                      <QuestionIcon className="cursor-pointer " width={16} height={16} />
                    </span>
                  </Tooltip>
                }
                labelClassName="!mb-[10px]"
                className="!mb-2"
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
              >
                <Input
                  placeholder="Enter a token symbol"
                  onBlur={() => {
                    const token = form.getFieldValue('governanceToken');
                    form.setFieldValue('governanceToken', token?.toUpperCase());
                  }}
                />
              </FormItem>
              <Link
                href="https://medium.com/@NFT_Forest_NFT/tutorial-how-to-buy-seeds-and-create-tokens-on-symbol-market-de3aa948bcb4"
                target="_blank"
                className="text-desc12 text-mainColor"
              >
                How to create a token?
              </Link>
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
