import { useState, useMemo } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { Flex } from 'antd';
import { FontWeightEnum, Typography } from 'aelf-design';
import './index.css';

const { Title } = Typography;

export enum CommonDaoLogoSizeEnum {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

const SIZE_CONFIG = {
  [CommonDaoLogoSizeEnum.Small]: {
    logoSize: 32,
    titleLevel: 7,
  },
  [CommonDaoLogoSizeEnum.Medium]: {
    logoSize: 40,
    titleLevel: 6,
  },
  [CommonDaoLogoSizeEnum.Large]: {
    logoSize: 48,
    titleLevel: 6,
  },
} as const;

interface ICommonDaoLogoProps {
  className?: string;
  daoName?: string;
  src: string;
  size?: CommonDaoLogoSizeEnum;
}

export default function CommonDaoLogo({
  className,
  daoName,
  src,
  size = CommonDaoLogoSizeEnum.Medium,
}: ICommonDaoLogoProps) {
  const [isError, setIsError] = useState<boolean>();

  const logoSize = useMemo(() => SIZE_CONFIG[size].logoSize, [size]);
  const titleLevel = useMemo(() => SIZE_CONFIG[size].titleLevel, [size]);

  return isError || !src ? (
    <Flex
      className={clsx('common-dao-logo', 'common-dao-logo-error', className)}
      style={{ width: logoSize, height: logoSize }}
      align="center"
      justify="center"
    >
      <Title className="text" level={titleLevel} fontWeight={FontWeightEnum.Medium}>
        {!!daoName && daoName[0]}
      </Title>
    </Flex>
  ) : (
    <Image
      className={clsx('common-dao-logo', className)}
      src={src}
      alt="logo"
      width={logoSize}
      height={logoSize}
      onError={() => setIsError(true)}
    />
  );
}
