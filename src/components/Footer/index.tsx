import LogoIcon from 'assets/revamp-icon/network-logo.svg';
import Link from 'next/link';

const NavFooter = () => {
  return (
    <div className="tmrwdao-grid">
      <div className="col-12 py-[20px]">
        <div className="flex flex-row justify-between items-start">
          <img src={LogoIcon} className="h-[18px] w-[18px]" alt="" />

          <div>
            <div className="flex flex-row items-center justify-end gap-[11px] lg:gap-[9px] xl:gap-[11px]">
              <Link
                href="https://t.me/tmrwdao"
                className="w-[24px] h-[24px] border-white border rounded-md border-solid flex justify-center items-center"
              >
                <i className="tmrwdao-icon-telegram text-[16px] text-white" />
              </Link>
              <Link
                href="https://github.com/TomorrowDAOProject"
                className="w-[24px] h-[24px] border-white border rounded-md border-solid flex justify-center items-center"
              >
                <i className="tmrwdao-icon-github text-[16px] text-white" />
              </Link>
              <Link
                href="https://x.com/tmrwdao"
                className="w-[24px] h-[24px] border-white border rounded-md border-solid flex justify-center items-center"
              >
                <i className="tmrwdao-icon-twitter text-[16px] text-white" />
              </Link>
            </div>
            <div className="mt-[10px] text-right">
              <Link
                href="/"
                className="text-white font-Syne no-underline text-[11.5px] lg:text-[7px] xl:text-[8.54px] hover:text-mainColor active:text-mainColor"
              >
                TMRW DAO@2024
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavFooter;
