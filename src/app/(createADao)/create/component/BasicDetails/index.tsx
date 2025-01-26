import './index.css';
import ChainAddress from 'components/Address';
import { urlRegex, twitterUsernameRegex, useRegisterForm } from '../utils';
import { EDaoGovernanceMechanism, StepEnum } from '../../type';
import { useSelector } from 'react-redux';
import { dispatch } from 'redux/store';
import { fetchTokenInfo } from 'api/request';
import { setToken } from 'redux/reducer/daoCreate';
import Link from 'next/link';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useForm, Controller } from 'react-hook-form';

import { curChain } from 'config';
import Input from 'components/Input';
import Textarea from 'components/Textarea';
import FormItem from 'components/FormItem';
import Upload, { IRefHandle } from 'components/Upload';
import Radio from 'components/Radio';
import Tooltip from 'components/Tooltip';
import LinkGroup from '../LinkGroup';
import Button from 'components/Button';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { shortenFileName } from 'utils/file';
import { useRef } from 'react';
import { SocialMedia } from 'types/dao';
import { LINK_TYPE } from 'constants/dao';

export const mediaList = [
  ['metadata', 'socialMedia', 'Twitter'],
  ['metadata', 'socialMedia', 'Github'],
  ['metadata', 'socialMedia', 'Facebook'],
  ['metadata', 'socialMedia', 'Telegram'],
  ['metadata', 'socialMedia', 'Discord'],
  ['metadata', 'socialMedia', 'Reddit'],
  ['metadata', 'socialMedia', 'Others'],
];

export default function BasicDetails() {
  const form = useForm({
    defaultValues: {
      metadata: {
        name: '',
        logoUrl: '',
        description: '',
        socialMedia: [['', '']] as [string, string][],
      },
      governanceMechanism: EDaoGovernanceMechanism.Token,
      members: { value: [''] },
      governanceToken: '',
    },
    mode: 'onChange',
  });
  const {
    watch,
    control,
    formState: { errors },
    trigger,
    setValue,
    getValues,
  } = form;
  const uploadRef = useRef<IRefHandle | null>(null);
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  const elfInfo = useSelector((store: any) => store.elfInfo.elfInfo);
  const { walletInfo: wallet } = useConnectWallet();
  const daoType = watch('governanceMechanism') ?? EDaoGovernanceMechanism.Token;
  const membersValue = watch('members.value') ?? [];
  const imgsUrl = watch('metadata.logoUrl');
  useRegisterForm(form, StepEnum.step0);

  return (
    <div className="basic-detail">
      <form>
        <FormItem label="Name" errorText={errors?.metadata?.name?.message}>
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
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter a name for the DAO"
                isError={!!errors?.metadata?.name?.message}
              />
            )}
          />
        </FormItem>
        <div className="flex flex-col lg:flex-row mb-[50px]">
          <FormItem label="Logo" className="lg:mb-0" errorText={errors?.metadata?.logoUrl?.message}>
            <Controller
              name="metadata.logoUrl"
              control={control}
              rules={{
                required: 'Logo is required',
              }}
              render={({ field }) => (
                <>
                  <Upload
                    ref={uploadRef}
                    className="mx-auto !w-[250px]"
                    needCheckImgSize
                    value={field.value}
                    uploadText="Upload"
                    tips={`Formats supported: PNG, JPG, JPEG \nRatio: 1:1 , less than 1 MB`}
                    onFinish={({ url }) => field.onChange(url)}
                  />

                  {imgsUrl && (
                    <div className="flex items-center justify-between py-1 md:px-3 mt-[15px] mx-auto">
                      <div className="flex items-center flex-grow">
                        <i className="text-lightGrey tmrwdao-icon-upload-document text-[20px]" />
                        <span className="ml-2 text-lightGrey text-desc14 font-Montserrat">
                          {shortenFileName(imgsUrl)}
                        </span>
                      </div>
                      <i
                        className="tmrwdao-icon-circle-minus text-[22px] ml-[6px] cursor-pointer text-Neutral-Secondary-Text"
                        onClick={() => {
                          setValue('metadata.logoUrl', '');
                          uploadRef.current?.reset();
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            />
          </FormItem>
          <FormItem
            label="Description"
            className="lg:ml-[50px] lg:mb-0 md:flex-grow"
            errorText={errors?.metadata?.description?.message}
          >
            <Controller
              name="metadata.description"
              control={control}
              rules={{
                required: 'Description is required',
                maxLength: {
                  value: 240,
                  message: 'The description should contain no more than 240 characters.',
                },
              }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  containerClassName={clsx('lg:h-[calc(100%-34px)]', {
                    'lg:!h-[calc(100%-57px)]': !!errors?.metadata?.logoUrl?.message,
                  })}
                  rootClassName="lg:h-full"
                  maxLength={240}
                  placeholder={`Enter the mission and vision of the DAO`}
                  isError={!!errors?.metadata?.description?.message}
                />
              )}
            />
          </FormItem>
        </div>
        <FormItem
          label={
            <div className="mb-[10px]">
              <span className="mb-2 block font-Montserrat text-descM16 text-white">Links</span>
              <span className="text-desc13 font-Montserrat text-lightGrey">
                Links to your DAO&apos;s website, social media profiles, discord, or other places
                your community gathers.
              </span>
            </div>
          }
        >
          <Controller
            name="metadata.socialMedia"
            control={control}
            rules={{
              required: true,
              validate: {
                validator: (socialMedia) => {
                  for (const [key, value] of socialMedia) {
                    if (!key && !!value) {
                      return 'Name is required';
                    }
                    if (key === LINK_TYPE.TWITTER) {
                      if (!twitterUsernameRegex.test(value)) {
                        return 'Please enter a correct X handle, starting with @.';
                      }
                      if (value.length > 15) {
                        return 'The X (Twitter) user name should be shorter than 15 characters.';
                      }
                    } else if (!!key && !urlRegex.test(value)) {
                      return 'Please enter a correct link. Shortened URLs are not supported.';
                    } else if (!!key && value.length > 128) {
                      return 'The URL should be shorter than 128 characters.';
                    }
                  }
                  return true;
                },
              },
            }}
            render={({ field }) => (
              <LinkGroup
                value={field.value as SocialMedia}
                onBlur={field.onBlur}
                onChange={field.onChange}
                errorText={errors?.metadata?.socialMedia?.message}
              />
            )}
          />
        </FormItem>
        <div className="mb-[15px]">
          <span className="text-descM16 font-Montserrat text-white">DAO&apos;s Metadata Admin</span>
        </div>
        <div className="mb-8">
          <ChainAddress
            address={walletInfo.address}
            chainId={curChain}
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
                Who can participate in governance?
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
                        mechanism is supported: &quot;1 address = 1 vote&quot;. With the governance
                        token enabled, DAOs can support an additional mechanism: &quot;1 token = 1
                        vote&quot;. You can choose the voting mechanism when you create proposals.
                      </p>
                    </>
                  }
                >
                  <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
                    Governance Token
                    <i className="tmrwdao-icon-information text-[18px]" />
                  </span>
                </Tooltip>
              }
              labelClassName="!mb-[10px]"
              className="!mb-2"
              errorText={errors?.governanceToken?.message}
            >
              <Controller
                name="governanceToken"
                control={control}
                rules={{
                  required: 'Governance_token is required',
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
                          return false;
                        }
                        return true;
                      } catch (error) {
                        return false;
                      }
                    },
                  },
                }}
                render={({ field }) => (
                  <Input
                    value={field.value}
                    placeholder="Enter a token symbol"
                    isError={!!errors?.governanceToken?.message}
                    onBlur={(value) => {
                      field.onChange(value?.toUpperCase());
                    }}
                  />
                )}
              />
            </FormItem>
            <Link
              href="https://medium.com/@NFT_Forest_NFT/tutorial-how-to-buy-seeds-and-create-tokens-on-symbol-market-de3aa948bcb4"
              target="_blank"
              className="mb-[50px] inline-block text-desc12 text-mainColor font-Montserrat"
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
                    <div className="text-[10px] leading-[12px]">
                      There is no limit on the number of addresses on your multisig. Addresses can
                      create proposals, create and approve transactions, and suggest changes to the
                      DAO settings after creation.
                    </div>
                  }
                >
                  <span className="flex items-center text-descM15 text-white font-Montserrat gap-[8px]">
                    Multisig Members Address
                    <i className="tmrwdao-icon-information text-[18px] text-white" />
                  </span>
                </Tooltip>
              }
              errorText={errors?.members?.value?.message}
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
                        isError={
                          address.endsWith(`AELF`) ||
                          !address.startsWith(`ELF`) ||
                          !address.endsWith(curChain)
                        }
                      />
                      <i
                        className={clsx(
                          'tmrwdao-icon-circle-minus text-white text-[22px] ml-[6px] cursor-pointer',
                          {
                            '!text-darkGray': membersValue.length <= 1,
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
              <div className="flex items-center gap-[9px]">
                <Button
                  className="!py-1 !text-[12px]"
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
                  className="!py-1 !text-[12px]"
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
            <div className="mb-[50px] mt-[32px]">
              <div className="flex justify-between">
                <span className="flex items-center pb-[8px] justify-between text-descM15 text-white font-Montserrat">
                  Total Addresses
                </span>
                <span className="text-descM16 text-white font-Montserrat">
                  {membersValue?.length}
                </span>
              </div>
              <div className="text-descM12 text-Neutral-Secondary-Text font-Montserrat">
                Your connected wallet has been automatically added to the list. You can remove it if
                you&apos;d like.
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
