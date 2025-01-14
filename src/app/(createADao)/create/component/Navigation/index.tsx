import { ReactComponent as ArrowRight } from 'assets/revamp-icon/arrow-right.svg';

const navigation = () => {
  return (
    <div className="md:mt-[47px] lg:mt-[67px] mb-[15px] dao-create-first-header hidden items-center gap-2 md:flex lg:flex">
      <span className="text-lightGrey text-[15px] cursor-pointer">TMRW DAO</span>
      <ArrowRight />
      <span className="text-white text-[14px]">Create a DAO</span>
    </div>
  );
};

export default navigation;
