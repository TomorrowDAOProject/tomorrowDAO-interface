import { ReactNode, useContext, useMemo, useState } from 'react';
// import { Flex, Checkbox, CheckboxProps } from 'antd';
import { HashAddress } from 'aelf-design';
import Image from 'next/image';
import CommonDaoLogo, { CommonDaoLogoSizeEnum } from 'components/CommonDaoLogo';
import { colorfulSocialMediaIconMap } from 'assets/imgs/socialMediaIcon';
import { useSelector } from 'redux/store';
import './index.css';
import { StepsContext, StepEnum, EDaoGovernanceMechanism } from '../../type';
import { curChain } from 'config';
import Modal from 'components/Modal';
import CheckBox from 'components/Checkbox';
import { ReactComponent as LinkIcon } from 'assets/revamp-icon/link.svg';
import Button from 'components/Button';

function SocialMediaItem({ name, url }: { name: string; url: string }) {
  return (
    <div className="social-media-item flex items-center gap-2 bg-[rgba(255,255,255,0.08)] rounded-sm">
      {(colorfulSocialMediaIconMap as any)[name] && (
        <Image src={(colorfulSocialMediaIconMap as any)[name]} alt="media" width={14} height={14} />
      )}

      <span className="text-lightGrey text-[12px]">{url}</span>
    </div>
  );
}

function CheckboxItem({
  label,
  descriptionList,
  checked,
  onChange,
}: {
  label?: string;
  descriptionList?: ({
    content: ReactNode;
    children?: ReactNode[];
  } | null)[];
  checked?: boolean;
  onChange?: any;
}) {
  const newDescriptionList = useMemo(() => {
    return descriptionList?.filter(Boolean) as {
      content: ReactNode;
      children?: ReactNode[];
    }[];
  }, [descriptionList]);

  return (
    <div className="flex flex-col gap-4 text-white mb-[30px]">
      <CheckBox
        checked={checked}
        label={label}
        onChange={onChange}
        className="preview-modal-checkbox"
      />
      {newDescriptionList?.map(({ content, children }, index) => (
        <div key={index} className="ml-6 flex gap-2 items-start">
          <div className="dot" />
          {children?.length ? (
            <div className="flex gap-2">
              <span className={`font-medium`}>{content}</span>
              {children.map((item, idx) => (
                <span key={idx} className="text-lightGrey text-[12px]">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-lightGrey text-[12px]">{content}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function AddressItem({
  label,
  address,
  isBoldLabel = false,
}: {
  label: string;
  address: string;
  isBoldLabel?: boolean;
}) {
  return (
    <div className={`flex items-center  flex-wrap ${isBoldLabel ? 'gap-2' : 'gap-0'}`}>
      {isBoldLabel ? (
        <div className="mr-1 text-white font-medium text-[15px]">{label}:</div>
      ) : (
        <span className="mr-2 text-white">{label}:</span>
      )}
      <HashAddress
        className="address text-lightGrey"
        ignoreEvent
        address={address}
        chain={curChain}
        primaryIconColor={'#989DA0'}
        addressHoverColor={'white'}
        addressActiveColor={'white'}
      />
    </div>
  );
}

export interface ICreatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CreatePreviewModal({ open, onClose, onConfirm }: ICreatePreviewModalProps) {
  const { stepForm } = useContext(StepsContext);
  const [state, setState] = useState([false, false, false]);
  const { walletInfo } = useSelector((store: any) => store.userInfo);

  const metaData = stepForm[StepEnum.step0].submitedRes;
  const governance = stepForm[StepEnum.step1].submitedRes;
  const highCouncil = stepForm[StepEnum.step2].submitedRes;
  const files = stepForm[StepEnum.step3].submitedRes;

  const isMultisig = metaData?.governanceMechanism === EDaoGovernanceMechanism.Multisig;
  const disabled =
    state.findIndex((item, index) => {
      // not highCouncil form, must be true
      if (index !== 1) {
        return item === false;
      } else {
        // highCouncil form, must be true(if highCouncil exist)
        return Object.keys(highCouncil ?? {}).length > 0 && item === false;
      }
    }) > -1;

  const socialMediaList = metaData?.metadata?.socialMedia?.map(([key, value]) => ({
    name: key,
    url: value,
  }));

  const logoUrl: any = metaData?.metadata?.logoUrl;

  const isAllChecked = useMemo(() => {
    return state.filter((item) => item === true).length === state.length;
  }, [state]);

  return (
    <Modal
      title="Confirm"
      // footerConfig={{
      //   buttonList: [{ children: 'Confirm', onClick: onConfirm, disabled: disabled }],
      // }}
      rootClassName="create-preview-modal"
      isVisible={open}
      onClose={onClose}
    >
      <div className="flex flex-col pt-[30px] max-h-[60vh] overflow-scroll confirm-content">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {logoUrl && (
              <CommonDaoLogo
                src={logoUrl}
                daoName={metaData?.metadata?.name}
                size={CommonDaoLogoSizeEnum.Small}
              />
            )}
            <div className="font-medium text-white text-[18px]">{metaData?.metadata?.name}</div>
          </div>
          <span className="text-lightGrey text-[13px]">{metaData?.metadata?.description}</span>
          <div className="flex gap-3 flex-wrap">
            {socialMediaList?.map(
              ({ name, url }, index) =>
                url && <SocialMediaItem key={index} name={name as string} url={url ?? ''} />,
            )}
          </div>
        </div>
        <div className="flex gap-4 flex-col mt-4">
          <AddressItem isBoldLabel label="Metadata admin" address={walletInfo.address} />
          {metaData?.governanceToken && (
            <div className="flex gap-2 items-center ">
              <span className="font-medium text-[15px] text-white">Governance token:</span>
              <span className="text-lightGrey text-[12px]">{metaData?.governanceToken}</span>
            </div>
          )}
        </div>
        <div className="h-[1px] w-full bg-[rgba(255,255,255,0.08)] my-[30px]"></div>
        <CheckboxItem
          label="Governance: Referendum"
          checked={state[0]}
          onChange={(value: boolean) => setState([value, state[1], state[2]])}
          descriptionList={[
            !isMultisig
              ? {
                  content: `Each proposal requires a minimum participation of ${governance?.minimalVoteThreshold} votes to be finalised.`,
                }
              : null,
            {
              content: `Each proposal must receive at least ${governance?.minimalApproveThreshold}% of approve votes to be approved.`,
            },
            metaData?.governanceToken
              ? {
                  content: `
                  A user must hold a minimum of ${governance?.proposalThreshold} governance token to initiate a proposal.`,
                }
              : null,
          ]}
        />
        {Object.keys(highCouncil ?? {}).length > 0 && (
          <CheckboxItem
            label="High Council"
            checked={state[1]}
            onChange={(value: boolean) => setState([state[0], value, state[2]])}
            descriptionList={[
              // {
              //   content: `
              //   ${highCouncil?.highCouncilConfig.maxHighCouncilMemberCount} members and ${highCouncil?.highCouncilConfig.maxHighCouncilCandidateCount} candidates at most, rotated every ${highCouncil?.highCouncilConfig.electionPeriod} days. Require a staking of at least ${highCouncil?.highCouncilConfig.stakingAmount} ${metaData?.governanceToken} tokens.
              //   `,
              // },
              // {
              //   content: (
              //     <AddressItem
              //       label="Election contract"
              //       address="ELF_2XDRhxzMbaYRCTe3NxRpARKBpjfQpyWdBkKscQpc3Tph3m6dqHG_AELF"
              //     />
              //   ),
              // },
              {
                content: `
                Each proposal requires ${highCouncil?.governanceSchemeThreshold.minimalVoteThreshold} votes to be finalised.`,
              },
              {
                content: `
                Each proposal must receive at least ${highCouncil?.governanceSchemeThreshold.minimalApproveThreshold}% of approve votes to beapproved.
                `,
              },
            ]}
          />
        )}
        <CheckboxItem
          checked={state[2]}
          onChange={(value: boolean) => setState([state[0], state[1], value])}
          label={`Documentation ${files?.files?.length ? `(${files?.files?.length})` : ''}`}
          descriptionList={files?.files?.map((item) => {
            return {
              content: item.name,
            };
          })}
        />
      </div>
      <Button
        type="default"
        className={`w-full flex items-center gap-1 hover:!border-lightGrey disabled:border-lightGrey  ${
          isAllChecked && '!bg-mainColor text-white'
        }`}
        onClick={() => {
          if (isAllChecked) onConfirm();
        }}
        disabled={!isAllChecked}
      >
        <span>Confirm</span>
        <i className="tmrwdao-icon-default-arrow text-[16px] text-inherit" />
      </Button>
    </Modal>
  );
}
