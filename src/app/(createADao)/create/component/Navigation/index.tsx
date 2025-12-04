import { useRouter } from 'next/navigation';
import './index.css';

const Navigation = () => {
  const nav = useRouter();
  return (
    <div className="md:mt-[63px] lg:mt-[63px] mb-[26px] mt-[24px] items-center gap-2 flex create-dao-navigation">
      <span
        className="text-lightGrey text-[15px] cursor-pointer home-text"
        onClick={() => nav.push('/')}
      >
        TMRW DAO
      </span>
      <i className="tmrwdao-icon-arrow text-[16px] text-lightGrey" />
      <span className="text-white text-[14px] create-dao">Create a DAO</span>
    </div>
  );
};

export default Navigation;
