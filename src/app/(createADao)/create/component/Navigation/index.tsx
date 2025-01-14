import { ReactComponent as ArrowRight } from 'assets/revamp-icon/arrow-right.svg';
import './index.css';

const navigation = () => {
  return (
    <div className="md:mt-[63px] lg:mt-[63px] mb-[26px] mt-[24px] items-center gap-2 flex create-dao-navigation">
      <span className="text-lightGrey text-[15px] cursor-pointer home-text">TMRW DAO</span>
      <ArrowRight />
      <span className="text-white text-[14px] create-dao">Create a DAO</span>
    </div>
  );
};

export default navigation;
