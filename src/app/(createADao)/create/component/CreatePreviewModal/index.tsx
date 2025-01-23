import { ReactNode, useContext, useMemo, useState } from 'react';
import { Flex, Checkbox, CheckboxProps } from 'antd';
import { FontWeightEnum, Typography, HashAddress } from 'aelf-design';
import Image from 'next/image';
import CommonModalSwitchDrawer from 'components/CommonModalSwitchDrawer';
import CommonDaoLogo, { CommonDaoLogoSizeEnum } from 'components/CommonDaoLogo';
import { colorfulSocialMediaIconMap } from 'assets/imgs/socialMediaIcon';
import { useSelector } from 'redux/store';
import './index.css';
import { StepsContext, StepEnum, EDaoGovernanceMechanism } from '../../type';
import { curChain } from 'config';

const { Text, Title } = Typography;

function SocialMediaItem({ name, url }: { name: string; url: string }) {
  return (
    <Flex className="social-media-item" gap={8} align="center">
      <Image src={(colorfulSocialMediaIconMap as any)[name]} alt="media" width={16} height={16} />
      <Text>{url}</Text>
    </Flex>
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
  onChange?: CheckboxProps['onChange'];
}) {
  const newDescriptionList = useMemo(() => {
    return descriptionList?.filter(Boolean) as {
      content: ReactNode;
      children?: ReactNode[];
    }[];
  }, [descriptionList]);
  return (
    <Flex vertical gap={16}>
      <Checkbox checked={checked} onChange={onChange} className="preview-modal-checkbox">
        <Title fontWeight={FontWeightEnum.Medium}>{label}</Title>
      </Checkbox>
      {newDescriptionList?.map(({ content, children }, index) => (
        <Flex key={index} className="ml-6" gap={8}>
          <div className="dot" />
          {children?.length ? (
            <Flex vertical gap={4}>
              <Text fontWeight={FontWeightEnum.Medium}>{content}</Text>
              {children.map((item, idx) => (
                <Text key={idx}>{item}</Text>
              ))}
            </Flex>
          ) : (
            <Text>{content}</Text>
          )}
        </Flex>
      ))}
    </Flex>
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
    <Flex gap={isBoldLabel ? 4 : 0} align="center" wrap="wrap">
      {isBoldLabel ? (
        <Title className="mr-1" fontWeight={FontWeightEnum.Medium}>
          {label}:
        </Title>
      ) : (
        <Text className="mr-2">{label}:</Text>
      )}
      <HashAddress className="address" ignoreEvent address={address} chain={curChain} />
    </Flex>
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

  const socialMediaList = Object.keys(metaData?.metadata?.socialMedia ?? {}).map((key) => {
    return {
      name: key,
      url: metaData?.metadata.socialMedia[key],
    };
  });

  const logoUrl = metaData?.metadata?.logoUrl?.[0]?.response?.url;
  return (
    <CommonModalSwitchDrawer
      commonClassName="create-preview-modal"
      title="Confirm"
      modalWidth={800}
      footerConfig={{
        buttonList: [{ children: 'Confirm', onClick: onConfirm, disabled: disabled }],
      }}
      open={open}
      onClose={onClose}
    >
      <Flex vertical gap={24}>
        <Flex vertical gap={12}>
          <Flex gap={8} align="center">
            {logoUrl && (
              <CommonDaoLogo
                src={logoUrl}
                daoName={metaData?.metadata?.name}
                size={CommonDaoLogoSizeEnum.Small}
              />
            )}
            <Title level={5} fontWeight={FontWeightEnum.Medium}>
              {metaData?.metadata?.name}
            </Title>
          </Flex>
          <Text>{metaData?.metadata.description}</Text>
          <Flex gap={12} wrap="wrap">
            {socialMediaList.map(
              ({ name, url }, index) =>
                url && <SocialMediaItem key={index} name={name as string} url={url ?? ''} />,
            )}
          </Flex>
        </Flex>
        <Flex vertical gap={16}>
          <AddressItem isBoldLabel label="Metadata admin" address={walletInfo.address} />
          {metaData?.governanceToken && (
            <Flex gap={8} align="center">
              <Title fontWeight={FontWeightEnum.Medium}>Governance token:</Title>
              <Text>{metaData?.governanceToken}</Text>
            </Flex>
          )}
        </Flex>
        <div className="divider" />
        <CheckboxItem
          label="Referendum"
          checked={state[0]}
          onChange={(e) => setState([e.target.checked, state[1], state[2]])}
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
            onChange={(e) => setState([state[0], e.target.checked, state[2]])}
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
          onChange={(e) => setState([state[0], state[1], e.target.checked])}
          label={`Documentation ${files?.files?.length ? `(${files?.files?.length})` : ''}`}
          descriptionList={files?.files?.map((item) => {
            return {
              content: item.name,
            };
          })}
        />
      </Flex>
    </CommonModalSwitchDrawer>
  );
}
