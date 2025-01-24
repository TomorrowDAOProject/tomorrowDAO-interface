import './index.css';
import Link from 'next/link';

export default function DAOHeader() {
  return (
    <div className="tmrwdao-grid">
      <div className="col-12 pt-[28px] md:pt-[50px] lg:pt-[60px] pb-[50px] md:pb-[70px] mb-[50px] md:mb-[70px] border-0 border-b-[1.5px] border-darkGrey border-solid">
        <div className="flex flex-col justify-between md:items-end md:flex-row gap-[35px] md:gap-[56px]">
          <div className="flex flex-col">
            <span className="block mb-[26px] text-[28px] md:text-[38px] font-normal font-Unbounded font-light text-white -tracking-[0.28px] md:-tracking-[0.38px]">
              Explore DAOs
            </span>
            <span className="block font-normal text-desc15 font-Montserrat text-white lg:whitespace-pre-wrap">
              {`A DAO platform that empowers decentralised governance in the aelf network and \necosystem. Creating, managing and engaging with DAOs is as simple as a few clicks.`}
            </span>
          </div>
          <div className="text-right">
            <Link
              href="/create"
              className="md:mt-0 primary-button text-descM12 font-Montserrat inline-flex items-center gap-[10px] whitespace-nowrap"
            >
              Create DAO
              <i className="tmrwdao-icon-default-arrow text-[16px] text-inherit" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
