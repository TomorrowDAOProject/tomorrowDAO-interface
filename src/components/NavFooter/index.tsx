import { ReactComponent as LogoIcon } from 'assets/revamp-icon/logo.svg';
import Link from 'next/link';

const NavFooter = () => {
  return (
    <div className="tmrwdao-grid">
      <div className="col-12 lg:py-[15px] xl:py-[19px]">
        <div className="flex flex-row justify-between items-center py-[28.58px] border-white border-solid border-0 border-b-[.5px]">
          <LogoIcon className="h-[20px] w-[128px]" />

          <div className="flex flex-row items-center gap-[11px] lg:gap-[9px] xl:gap-[11px]">
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
        </div>
        <div className="flex flex-row justify-between items-center py-[14px]">
          <div className="flex flex-row items-center gap-[12px] lg:gap-[27px] xl:gap-[34px]">
            <Link
              href={`${
                process.env.NODE_ENV == 'production'
                  ? 'https://docs.tmrwdao.com/'
                  : 'https://tmrwdao-docs-testnet.aelf.dev/'
              }`}
              className="text-white font-Syne no-underline text-[11.5px] lg:text-[9.5px] xl:text-[11.5px] hover:text-mainColor active:text-mainColor"
            >
              Docs
            </Link>
          </div>

          <Link
            href="/"
            className="text-white font-Syne no-underline text-[11.5px] lg:text-[7px] xl:text-[8.54px] hover:text-mainColor active:text-mainColor"
          >
            TMRW DAO@2024
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavFooter;
