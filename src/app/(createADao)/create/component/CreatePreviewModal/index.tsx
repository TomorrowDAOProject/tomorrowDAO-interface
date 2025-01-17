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
import Button from 'components/Button';

function SocialMediaItem({ name, url }: { name: string; url: string }) {
  return (
    <div className="social-media-item flex items-center gap-2 bg-[rgba(255,255,255,0.08)] rounded-sm">
      <Image src={(colorfulSocialMediaIconMap as any)[name]} alt="media" width={16} height={16} />
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
  onChange?: () => void;
}) {
  const newDescriptionList = useMemo(() => {
    return descriptionList?.filter(Boolean) as {
      content: ReactNode;
      children?: ReactNode[];
    }[];
  }, [descriptionList]);
  return (
    <div className="flex flex-col gap-4 text-white mb-[30px]">
      <div onChange={onChange} className="preview-modal-checkbox">
        <div className={`font-[500] text-[15px]`}>{label}</div>
      </div>
      {newDescriptionList?.map(({ content, children }, index) => (
        <div key={index} className="ml-6 flex gap-2 items-start">
          <div className="dot" />
          {children?.length ? (
            <div className="flex gap-2">
              <span className={`font-[500]`}>{content}</span>
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
        <div className="mr-1 text-white font-[500] text-[15px]">{label}:</div>
      ) : (
        <span className="mr-2 text-white">{label}:</span>
      )}
      <HashAddress className="address text-white" ignoreEvent address={address} chain={curChain} />
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

  console.log('metaData', metaData, governance, highCouncil, files);

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

  const socialMediaList = Object.keys(metaData?.metadata?.socialMedia ?? {}).map((key) => {
    return {
      name: key,
      url: metaData?.metadata.socialMedia[key],
    };
  });

  const logoUrl: any = metaData?.metadata?.logoUrl;

  console.log('metaData', metaData);

  console.log('open', open);
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
      <div className="flex flex-col mt-[30px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {logoUrl && (
              <CommonDaoLogo
                src={logoUrl}
                daoName={metaData?.metadata?.name}
                size={CommonDaoLogoSizeEnum.Small}
              />
            )}
            <div className="font-[500] text-white text-[18px]">{metaData?.metadata?.name}</div>
          </div>
          <span className="text-lightGrey text-[13px]">{metaData?.metadata?.description}</span>
          <div className="flex gap-3 flex-wrap">
            {socialMediaList.map(
              ({ name, url }, index) =>
                url && <SocialMediaItem key={index} name={name as string} url={url ?? ''} />,
            )}
          </div>
        </div>
        <div className="flex gap-4 flex-col mt-4">
          <AddressItem isBoldLabel label="Metadata admin" address={walletInfo.address} />
          {metaData?.governanceToken && (
            <div className="flex gap-2 items-center ">
              <span className="font-[500] text-[15px] text-white">Governance token:</span>
              <span className="text-lightGrey text-[12px]">{metaData?.governanceToken}</span>
            </div>
          )}
        </div>
        <div className="h-[1px] w-full bg-[rgba(255,255,255,0.08)] my-[30px]"></div>
        <CheckboxItem
          label="Governance: Referendum"
          checked={state[0]}
          // setState([e.target.checked, state[1], state[2]])
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
            //  setState([state[0], e.target.checked, state[2]])
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
          // setState([state[0], state[1], e.target.checked])
          label={`Documentation ${files?.files?.length ? `(${files?.files?.length})` : ''}`}
          descriptionList={files?.files?.map((item) => {
            return {
              content: item.name,
            };
          })}
        />
        <Button>Confirm</Button>
      </div>
    </Modal>
  );
}
