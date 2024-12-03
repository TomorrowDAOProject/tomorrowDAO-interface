import { ReactComponent as LogoIcon } from 'assets/revamp-icon/logo.svg';
import { ReactComponent as DiscordIcon } from 'assets/revamp-icon/icon-discord.svg';
import { ReactComponent as TelegramIcon } from 'assets/revamp-icon/icon-telegram.svg';
import { ReactComponent as GithubIcon } from 'assets/revamp-icon/icon-github.svg';
import { ReactComponent as TwitterIcon } from 'assets/revamp-icon/icon-twitter.svg';
import Link from 'next/link';

const NavFooter = () => {
  return (
    <div className="tmrwdao-grid">
      <div className="col-12 lg:py-[15px] xl:py-[19px]">
        <div className="flex flex-row justify-between items-start py-[28.58px] border-white border-solid border-0 border-b-[.5px]">
          <LogoIcon className="h-[20px] w-[128px]" />

          <div className="flex flex-row items-center gap-[12px]">
            <Link href="/" className="text-transparent">
              <DiscordIcon className="h-[28.6px] w-[28.6px] lg:h-[23px] lg:w-[23px] xl:h-[28.6px] xl:w-[28.6px]" />
            </Link>
            <Link href="/" className="text-transparent">
              <TelegramIcon className="h-[28.6px] w-[28.6px] lg:h-[23px] lg:w-[23px] xl:h-[28.6px] xl:w-[28.6px]" />
            </Link>
            <Link href="/" className="text-transparent">
              <GithubIcon className="h-[28.6px] w-[28.6px] lg:h-[23px] lg:w-[23px] xl:h-[28.6px] xl:w-[28.6px]" />
            </Link>
            <Link href="/" className="text-transparent">
              <TwitterIcon className="h-[28.6px] w-[28.6px] lg:h-[23px] lg:w-[23px] xl:h-[28.6px] xl:w-[28.6px]" />
            </Link>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center py-[14px]">
          <div className="flex flex-row items-center gap-[12px]">
            <Link
              href="/"
              className="text-white font-Syne no-underline text-[11.5px] lg:text-[9.5px] xl:text-[11.5px]"
            >
              Docs
            </Link>
            <Link
              href="/"
              className="text-white font-Syne no-underline text-[11.5px] lg:text-[9.5px] xl:text-[11.5px]"
            >
              White Paper
            </Link>
            <Link
              href="/"
              className="text-white font-Syne no-underline text-[11.5px] lg:text-[9.5px] xl:text-[11.5px]"
            >
              Send Feedback
            </Link>
          </div>

          <Link
            href="/"
            className="text-white font-Syne no-underline text-[11.5px] lg:text-[7px] xl:text-[8.54px]"
          >
            TMRW DAO@2024
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavFooter;