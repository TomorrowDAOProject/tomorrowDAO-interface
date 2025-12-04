import { ReactNode } from 'react';
import clsx from 'clsx';
import { Flex } from 'antd';
import { Typography, FontWeightEnum } from 'aelf-design';
import Image from 'next/image';
import closeIcon from 'assets/imgs/close.svg';
import './index.css';

const { Title } = Typography;

interface ICommonHeaderProps {
  title: ReactNode;
  onClose: (e: any) => void;
}

export default function CommonHeader({ title, onClose }: ICommonHeaderProps) {
  return (
    <Flex className={clsx('common-header', { ['!mb-6']: !!title })} align="center">
      <Title className="common-header-title" level={6} fontWeight={FontWeightEnum.Medium}>
        {title}
      </Title>
      <Image
        className="common-header-close"
        src={closeIcon}
        alt="close"
        width={24}
        height={24}
        onClick={onClose}
      />
    </Flex>
  );
}
