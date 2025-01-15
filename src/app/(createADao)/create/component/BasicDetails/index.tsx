import './index.css';
import ChainAddress from 'components/Address';
import { ReactComponent as QuestionIcon } from 'assets/imgs/question-icon.svg';
import { useMemo, useState } from 'react';
import { mediaValidatorMap, useRegisterForm } from '../utils';
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
import FormMembers from 'components/FormMembers';
import Button from 'components/Button';
import clsx from 'clsx';
import { toast } from 'react-toastify';

export const mediaList = [
  ['metadata', 'socialMedia', 'Twitter'],
  ['metadata', 'socialMedia', 'Facebook'],
  ['metadata', 'socialMedia', 'Telegram'],
  ['metadata', 'socialMedia', 'Discord'],
  ['metadata', 'socialMedia', 'Reddit'],
];

export default function BasicDetails() {
  const form = useForm({
    defaultValues: {
      metadata: {
        name: '',
        logoUrl: '',
        description: '',
        socialMedia: ['', ''],
      },
      governanceMechanism: EDaoGovernanceMechanism.Token,
      members: { value: [''] },
      governanceToken: '',
    },
  });
  const { watch, control, setValue, getValues, handleSubmit } = form;
  const [mediaData, setMediaData] = useState([{ name: '', value: '' }]);
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  const elfInfo = useSelector((store: any) => store.elfInfo.elfInfo);
  const { walletInfo: wallet } = useConnectWallet();
  const daoType = watch('governanceMechanism') ?? EDaoGovernanceMechanism.Token;
  const membersValue = watch('members.value') ?? [];
  // useRegisterHookForm(form, StepEnum.step0);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <div className="basic-detail">
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormItem label="Name">
            <Controller
              name="metadata.name"
              control={control}
              rules={{
                required: 'The name is required',
                maxLength: {
                  value: 50,
                  message: 'The name should contain no more than 50 characters.',
                },
              }}
              render={({ field }) => <Input placeholder="Enter a name for the DAO" {...field} />}
            />
          </FormItem>
          <div className="flex flex-col lg:flex-row">
            <FormItem label="Logo">
              <Controller
                name="metadata.logoUrl"
                control={control}
                rules={{
                  required: 'Logo is required',
                }}
                render={({ field }) => (
                  <Upload
                    {...field}
                    className="mx-auto !w-[250px]"
                    needCheckImgSize
                    uploadText="Upload"
                    tips={`Formats supported: PNG and JPG.\n Ratio: 1:1 , less than 1 MB.`}
                    onFinish={({ url }) => field.onChange(url)}
                  />
                )}
              />
            </FormItem>
            <FormItem label="Description" className="lg:ml-[50px] md:flex-grow">
              <Controller
                name="metadata.description"
                control={control}
                rules={{
                  required: 'description is required',
                  minLength: {
                    value: 240,
                    message: 'The description should contain no more than 240 characters.',
                  },
                }}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rootClassName="lg:h-[250px]"
                    maxLength={240}
                    placeholder={`Enter the mission and vision of the DAO (240 characters max). This can be modified after DAO is created.`}
                  />
                )}
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
            name="metadata.socialMedia"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <LinkGroup links={mediaData} {...field} />}
          />
          {/* 
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
          </FormItem> */}
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
          >
            <Controller
              name="governanceMechanism"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Radio
                  {...field}
                  options={[
                    { label: 'Token holders', value: EDaoGovernanceMechanism.Token },
                    { label: 'Multisig Members', value: EDaoGovernanceMechanism.Multisig },
                  ]}
                  onChange={(value) => {
                    field.onChange(value);
                    setValue('governanceToken', '');
                    if (value === EDaoGovernanceMechanism.Multisig) {
                      setValue('members.value', [`ELF_${wallet?.address}_${curChain}`]);
                    } else {
                      setValue('members.value', []);
                    }
                  }}
                />
              )}
            />
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
              >
                <Controller
                  name="governanceToken"
                  control={control}
                  rules={{
                    required: 'governance_token is required',
                    validate: {
                      validator: async (value) => {
                        try {
                          const reqParams = {
                            symbol: value ?? '',
                            chainId: elfInfo.curChain,
                          };
                          const { data } = await fetchTokenInfo(reqParams);
                          dispatch(setToken(data));
                          if (!data.name) {
                            toast.error('The token has not yet been issued');
                            return false;
                          }
                          return true;
                        } catch (error) {
                          toast.error('The token has not yet been issued.');
                          return false;
                        }
                      },
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter a token symbol"
                      onBlur={() => {
                        const token = getValues('governanceToken');
                        setValue('governanceToken', token?.toUpperCase());
                      }}
                    />
                  )}
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
              <FormItem
                label={
                  <Tooltip
                    title={
                      <div>
                        There is no limit on the number of addresses on your multisig. Addresses can
                        create proposals, create and approve transactions, and suggest changes to
                        the DAO settings after creation.
                      </div>
                    }
                  >
                    <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
                      Multisig Members Address
                      <i className="tmrwdao-icon-document text-[18px] text-white" />
                    </span>
                  </Tooltip>
                }
              >
                {membersValue.map((address, index) => (
                  <Controller
                    key={`${address}_${index}`}
                    name="members.value"
                    control={control}
                    rules={{
                      required: 'Address is required',
                      validate: {
                        validator: (value) => {
                          if (value[index].endsWith(`AELF`)) {
                            return 'Must be a SideChain address';
                          }
                          if (!value[index].startsWith(`ELF`) || !value[index].endsWith(curChain)) {
                            return 'Must be a valid address';
                          }
                        },
                      },
                    }}
                    render={({ field }) => (
                      <div className="flex items-center mb-4">
                        <Input
                          value={address}
                          placeholder={`Enter ELF_..._${curChain}`}
                          onBlur={(value) => {
                            const newList = [...membersValue];
                            newList[index] = value;
                            field.onChange(newList);
                          }}
                        />
                        <i
                          className={clsx(
                            'tmrwdao-icon-circle-minus text-white text-[22px] ml-[6px] cursor-pointer',
                            {
                              'text-darkGray': membersValue.length <= 1,
                            },
                          )}
                          onClick={() => {
                            if (membersValue.length <= 1) return;
                            const originList = [...membersValue];
                            originList.splice(index, 1);
                            setValue('members.value', originList);
                          }}
                        />
                      </div>
                    )}
                  />
                ))}
                <div className="dynamic-form-buttons text-neutralTitle">
                  <Button
                    className="!py-[2px] !text-[12px]"
                    type="default"
                    onClick={() => {
                      const originList = [...membersValue, ''];
                      setValue('members.value', originList);
                    }}
                  >
                    <i className="tmrwdao-icon-circle-add text-[22px] mr-[6px]" />
                    Add Address
                  </Button>
                  <Button
                    className="!py-[2px] !text-[12px]"
                    type="default"
                    onClick={() => {
                      setValue('members.value', ['']);
                    }}
                  >
                    <i className="tmrwdao-icon-delete text-[22px] mr-[6px]" />
                    Delete All
                  </Button>
                </div>
              </FormItem>
              <div className="mt-[32px]">
                <div className="flex justify-between">
                  <span className="flex items-center pb-[8px] justify-between text-descM15 text-white font-Montserrat">
                    Total Addresses
                  </span>
                  <span className="text-descM16 text-white font-Montserrat">
                    {membersValue?.length}
                  </span>
                </div>
                <div className="text-descM12 text-Neutral-Secondary-Text mb-[32px]">
                  Your connected wallet has been automatically added to the list. You can remove it
                  if you&apos;d like.
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
