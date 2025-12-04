import { QRCode, IProps } from 'react-qrcode-logo';

interface IQRCode extends IProps {
  value: string;
  className?: string;
  size?: number;
  quietZone?: number;
  ecLevel?: IProps['ecLevel'];
}

export default function QRCodeCommon({
  value,
  size,
  quietZone,
  ecLevel,
  ...props
}: Readonly<IQRCode>) {
  return (
    <QRCode
      value={value}
      size={size ?? 200}
      quietZone={quietZone ?? 10}
      logoImage={'/images/tg/portkey-logo.png'}
      logoWidth={24}
      logoHeight={24}
      qrStyle="squares"
      eyeRadius={{ outer: 4, inner: 1 }}
      ecLevel={ecLevel ?? 'M'}
      {...props}
    />
  );
}
