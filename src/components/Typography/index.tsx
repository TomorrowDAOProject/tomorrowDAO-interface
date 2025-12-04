interface ITypographyProps {
  children: string;
}

const Typography = ({ children }: ITypographyProps) => {
  return (
    <p className="py-[13px] pl-[] pr-rounded-[8px] border border-solid border-fillBg8 bg-darkBg">
      <span>{children}</span>
      <span className="tmrwdao-icon-profile text-white text-[20px]" />
    </p>
  );
};

export default Typography;
