import Image from 'next/image';
import SuccessGreenIcon from 'assets/imgs/success-green.svg';
import WaringIcon from 'assets/imgs/waring.svg';
import Button from 'components/Button';

type TPropsType = {
  onOk: (p: boolean) => void;
  title: string;
  firstText?: string;
  secondText?: string;
  type?: 'failed' | 'success';
  btnText?: string;
};

const typeMap = {
  failed: WaringIcon,
  success: SuccessGreenIcon,
};

export default function Info(props: TPropsType) {
  const { onOk, title, firstText, secondText, type, btnText } = props;
  return (
    <div>
      {type && (
        <Image className="mx-auto block" width={56} height={56} src={typeMap[type]} alt="" />
      )}
      <div className="text-center text-white font-medium mt-4 text-[18px]">{title}</div>

      <p className="text-center text-lightGrey font-medium text-[12px]">{firstText}</p>
      <p className="text-center text-lightGrey font-medium text-[12px]">{secondText}</p>
      {btnText && (
        <Button
          className="mx-auto mt-[30px] w-full"
          type="primary"
          onClick={() => {
            onOk(false);
          }}
        >
          {btnText}
        </Button>
      )}
    </div>
  );
}
