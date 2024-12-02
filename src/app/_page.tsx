import Link from 'next/link';
import { ReactComponent as LinkIcon } from 'assets/revamp-icon/link.svg';
import { ReactComponent as LargeArrowIcon } from 'assets/revamp-icon/arrow-large.svg';
import { ReactComponent as ArrowSymbolIcon } from 'assets/revamp-icon/arrow-symbol.svg';
import { ReactComponent as ArrowFilledIcon } from 'assets/revamp-icon/arrow-filled.svg';
import { ReactComponent as AwakenIcon } from 'assets/revamp-icon/awaken.svg';
import { ReactComponent as BeangoIcon } from 'assets/revamp-icon/beango.svg';
import { ReactComponent as BridgeIcon } from 'assets/revamp-icon/bridge.svg';
import { ReactComponent as EtransferIcon } from 'assets/revamp-icon/etransfer.svg';
import { ReactComponent as ForestIcon } from 'assets/revamp-icon/forest.svg';
import { ReactComponent as PortkeyIcon } from 'assets/revamp-icon/portkey.svg';
import { ReactComponent as SchordingerIcon } from 'assets/revamp-icon/schordinger.svg';
import { ReactComponent as LongArrowIcon } from 'assets/revamp-icon/long-arrow.svg';
import Collapse, { itemType } from 'components/Collapse';
import Swiper from 'components/Swiper';
import NavFooter from 'components/NavFooter';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';

type PageProps = {
  parentRef: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
};

const collapseItems: itemType[] = [
  {
    key: '1',
    label: 'AI agents in DAO governance',
    children:
      'Drafting proposals, whitepapers, manifestos, and posts, summarizing governance decisions, and onboarding new members through on-chain reputation or credential storage.',
  },
  {
    key: '2',
    label: 'AI-assisted data analysis',
    children:
      'Offering analysis and insights on proposals by leveraging data analytics to identify behavior patterns or voting trends among members, aiding the DAO in making informed decisions about proposals or governance structure changes.',
  },
  {
    key: '3',
    label: 'Swarm Intelligence',
    children:
      'AI agents can act as links or liaisons between DAOs, creating a "swarm intelligence" where agents or DAOs collaborate seamlessly without human facilitation.',
  },
];

const posts = [
  {
    title: 'Creating your own DAO',
    description: 'The Ultimate Guide to Creating Your Own DAO',
    date: 'Apr 15, 2024',
    img: require('assets/revamp-imgs/Image-1.jpg').default.src,
  },
  {
    title: 'DAOs vs Traditional Organisations',
    description: 'DAOs vs Traditional Organisations: A Head-to-Head Comparison',
    date: 'Apr 15, 2024',
    img: require('assets/revamp-imgs/Image-2.jpg').default.src,
  },
  {
    title: 'Top 10 DAOs',
    description: 'Best Decentralised Autonomous Organisations (DAO), Ranked by Market Cap',
    date: 'Apr 15, 2024',
    img: require('assets/revamp-imgs/Image-3.jpg').default.src,
  },
];

const Arrow = ({ isActive }: PanelProps): React.ReactNode => {
  return (
    <LargeArrowIcon
      className={clsx(
        'w-[12px] h-[11px] lg:w-[16px] lg:h-[14.5px] lg:w-[20px] lg:h-[18px]',
        isActive ? 'rotate-[-180deg]' : '',
      )}
    />
  );
};

const Page = ({ parentRef, onScroll }: PageProps) => {
  const [scrollPercent, setScrollPercent] = useState(0);

  const handleScroll = () => {
    if (parentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      const currentScroll = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollPercent(currentScroll);
    }
    onScroll?.();
  };

  useEffect(() => {
    const scrollContainer = parentRef.current;
    if (!scrollContainer) return;

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const swiperIndex = useMemo(() => {
    if (scrollPercent < 34) return 0;
    if (scrollPercent < 58) return 1;
    return 2;
  }, [scrollPercent]);

  return (
    <>
      <div className="tmrwdao-grid z-0">
        <div className="col-12 box-border">
          <section className="relative">
            <img
              className="absolute w-full h-auto object-cover z-0 md:w-auto md:h-[335px] md:top-[40%] md:left-1/2 md:translate-x-[-50%] md:translate-y-[-50%] lg:top-[45%] lg:left-auto lg:right-[-60px] xl:right-[-80px] lg:translate-x-0 lg:h-[529.5px] xl:h-[662px]"
              src={require('assets/revamp-imgs/Intro.gif').default.src}
              alt=""
            />
            <div className="relative py-[25px] flex flex-col justify-center h-[calc(100vh-90px)] box-border z-10">
              <h1 className="mt-[50px] mb-0 text-[36px] font-Unbounded font-light text-white tracking-[-2.88px] lg:tracking-[-4.32px] xl:tracking-[-5.28px] lg:tracking-[-4.32px] xl:tracking-[-5.28px] lg:mt-0 lg:whitespace-pre-wrap lg:text-[54px] xl:text-[66px]">
                {`TMRWDAO:`} <br />
                {`Where Your Vision Fuels \nThe Future`}
              </h1>
              <p className="my-[50px] text-[14px] font-Unbounded font-light text-white text-right tracking-[-.56px] lg:tracking-[-.52px] xl:tracking-[-0.6px] whitespace-pre-wrap sm:whitespace-normal lg:text-[13px] lg:mt-[-30px] lg:mb-[60px] xl:mb-[75px] xl:text-[15px]">{`/Empowering Communities,\n Shaping the Future`}</p>

              <div className="flex flex-col items-start gap-[9.68px] sm:flex-row lg:gap-[6px] xl:gap-[10px]">
                <Link href="/" className="primary-button inline-flex items-center gap-[10px]">
                  Create DAO
                  <LinkIcon className="h-[11px] w-[11px]" />
                </Link>
                <Link href="/" className="default-button inline-flex items-center gap-[10px]">
                  View Documentations
                  <LinkIcon className="h-[11px] w-[11px]" />
                </Link>
              </div>
            </div>

            <LongArrowIcon className="w-[34px] h-[34px] xl:w-[42px] xl:h-[42px] absolute bottom-0 lg:bottom-[33px] xl:bottom-[41px] left-1/2 translate-x-[-50%] animate-up-down" />
          </section>

          <section className="py-[56px] md:py-[55px] lg:py-[24px] xl:py-[30px]">
            <div className="flex flex-row items-center gap-[20px] w-full overflow-x-auto lg:overflow-hidden lg:flex-wrap">
              <div className="relative overflow-hidden group flex flex-col items-start justify-end w-full h-[246px] lg:h-[251px] xl:h-[314px] shrink-0 py-[14px] px-[22px] lg:py-[8px] xl:py-[10] lg:hover:py-[27px] lg:hover:py-[33px] bg-darkGray rounded-[15px] lg:rounded-none lg:rounded-t-[24px] xl:rounded-t-[30px] box-border transition-all duration-300 xs:w-[335px] lg:flex-row lg:items-end lg:justify-start lg:w-full hover:bg-mainColor">
                <p className="absolute top-[30px] left-[26px] xl:left-[33px] xl:top-[37px] m-0 text-[12px] font-Unbounded font-light text-white xl:text-[15px] transition-[opacity] duration-300 lg:opacity-100 lg:group-hover:opacity-0 hidden lg:block">
                  01
                </p>
                <LargeArrowIcon className="absolute top-[16px] right-[16px] xl:right-[20px] xl:top-[20px] w-[18px] h-[20px] rotate-[-135deg] transition-[opacity] duration-300 opacity-0 lg:group-hover:opacity-100" />
                <div className="absolute w-[224px] h-[224px] top-[-83px] right-[-64px] lg:w-[374px] lg:h-[374px] lg:top-[-166px] lg:right-[-82px] xl:w-[464px] xl:h-[464px] xl:top-[-208px] xl:right-[-101px] bg-[url(https://cdn.tmrwdao.com/assets/imgs/B9A0510D246F.webp)] bg-cover"></div>
                <h2 className="mb-[23px] text-[20px] font-Unbounded font-light text-white lg:text-[19.2px] xl:text-[24px] transition-[height] duration-300 lg:shrink-0 lg:pr-[50px] lg:mb-0 lg:whitespace-pre-wrap lg:h-[39px] lg:group-hover:h-[62.39px] xl:h-[53px] xl:group-hover:h-[76.78px]">
                  Create a DAO
                </h2>
                <p className="m-0 text-[14px] lg:text-[13px] font-Montserrat xl:text-[16px] font-normal text-white leading-[160%] overflow-hidden transition-[height,opacity] duration-300 lg:opacity-0 lg:group-hover:opacity-100 lg:mb-0 lg:whitespace-pre-wrap lg:h-[39px] lg:group-hover:h-[62.39px] xl:h-[53px] xl:group-hover:h-[76.78px]">
                  {`Set up your DAO effortlessly and shape its mission and governance. \nBuild a thriving community where every member has a voice in \ndriving the organization's success.`}
                </p>
              </div>
              <div className="relative overflow-hidden group flex flex-col items-start justify-end w-full h-[246px] lg:h-[239px] xl:h-[298px] shrink-0 py-[14px] px-[22px] lg:py-[8px] xl:py-[10] lg:hover:py-[27px] lg:hover:py-[33px] bg-darkGray rounded-[15px] lg:rounded-none lg:rounded-bl-[24px] xl:rounded-bl-[30px] box-border xs:w-[335px] transition-all duration-300 xs:w-[335px] lg:hover:bg-mainColor lg:w-[calc((100%-40px)/3)]">
                <p className="absolute top-[30px] left-[26px] xl:left-[33px] xl:top-[37px] m-0 text-[12px] font-Unbounded font-light text-white xl:text-[15px] transition-[opacity] duration-300 lg:opacity-100 lg:group-hover:opacity-0 hidden lg:block">
                  02
                </p>
                <LargeArrowIcon className="absolute top-[16px] right-[16px] xl:right-[20px] xl:top-[20px] w-[18px] h-[20px] rotate-[-135deg] transition-[opacity] duration-300 opacity-0 lg:group-hover:opacity-100" />
                <div className="absolute w-[141px] h-[166px] top-[-12px] right-[15px] lg:w-[123px] lg:h-[144px] lg:top-[20px] lg:right-[34px] xl:w-[153px] xl:h-[180px] xl:top-[25px] xl:right-[42px] lg:group-hover:top-[60px] xl:group-hover:top-[70px]  bg-[url(https://cdn.tmrwdao.com/assets/imgs/E4C130294BCF.webp)] bg-cover transition-[top] duration-300"></div>
                <h2 className="mb-[23px] lg:mb-[19px] font-Unbounded lg:group-hover:mb-[23px] text-[20px] font-light text-white lg:text-[19.2px] xl:text-[24px] transition-[margin] duration-500">
                  Elect high council
                </h2>
                <p className="m-0 text-[14px] lg:text-[13px] font-Montserrat xl:text-[16px] font-normal text-white leading-[160%] overflow-hidden transition-[max-height,margin] duration-500 lg:max-h-0 lg:group-hover:max-h-[150px]">
                  Give special voting powers to key members with the High Council feature. Manage
                  your core team to ensure critical proposals are reviewed by trusted individuals.
                </p>
              </div>
              <div className="relative overflow-hidden group flex flex-col items-start justify-end w-full h-[246px] lg:h-[239px] xl:h-[298px] shrink-0 py-[14px] px-[22px] lg:py-[8px] xl:py-[10] lg:hover:py-[27px] lg:hover:py-[33px] bg-darkGray rounded-[15px] lg:rounded-none box-border xs:w-[335px] transition-all duration-300 xs:w-[335px] lg:hover:bg-mainColor lg:w-[calc((100%-40px)/3)]">
                <p className="absolute top-[30px] left-[26px] xl:left-[33px] xl:top-[37px] m-0 text-[12px] font-Unbounded font-light text-white xl:text-[15px] transition-[opacity] duration-300 lg:opacity-100 lg:group-hover:opacity-0 hidden lg:block">
                  03
                </p>
                <LargeArrowIcon className="absolute top-[16px] right-[16px] xl:right-[20px] xl:top-[20px] w-[18px] h-[20px] rotate-[-135deg] transition-[opacity] duration-300 opacity-0 lg:group-hover:opacity-100" />
                <div className="absolute w-[163px] h-[176px] top-[-36px] right-[-13px] lg:w-[148.5px] lg:h-[159px] lg:top-[23px] lg:right-[27px] xl:w-[184px] xl:h-[198px] xl:top-[29px] xl:right-[33.5px] lg:group-hover:top-[66px] xl:group-hover:top-[76px]  bg-[url(https://cdn.tmrwdao.com/assets/imgs/52696FF56C74.webp)] bg-cover transition-[top] duration-300"></div>
                <h2 className="mb-[23px] lg:mb-[19px] font-Unbounded lg:group-hover:mb-[23px] text-[20px] font-light text-white lg:text-[19.2px] xl:text-[24px] transition-[margin] duration-500">
                  Create proposals
                </h2>
                <p className="m-0 text-[14px] lg:text-[13px] font-Montserrat xl:text-[16px] font-normal text-white leading-[160%] overflow-hidden transition-[max-height,margin] duration-500 lg:max-h-0 lg:group-hover:max-h-[150px]">
                  Create and submit proposals for managing funds, adjusting rules, and more. Let
                  your community vote and shape the future with collective decision-making.
                </p>
              </div>
              <div className="relative overflow-hidden group flex flex-col items-start justify-end w-full h-[246px] lg:h-[239px] xl:h-[298px] shrink-0 py-[14px] px-[22px] lg:py-[8px] xl:py-[10] lg:hover:py-[27px] lg:hover:py-[33px] bg-darkGray rounded-[15px] lg:rounded-none lg:rounded-br-[24px] xl:rounded-br-[30px] box-border xs:w-[335px] transition-all duration-300 xs:w-[335px] lg:hover:bg-mainColor lg:w-[calc((100%-40px)/3)]">
                <p className="absolute top-[30px] left-[26px] xl:left-[33px] xl:top-[37px] m-0 text-[12px] font-Unbounded font-light text-white xl:text-[15px] transition-[opacity] duration-300 lg:opacity-100 lg:group-hover:opacity-0 hidden lg:block">
                  04
                </p>
                <LargeArrowIcon className="absolute top-[16px] right-[16px] xl:right-[20px] xl:top-[20px] w-[18px] h-[20px] rotate-[-135deg] transition-[opacity] duration-300 opacity-0 lg:group-hover:opacity-100" />
                <div className="absolute w-[236px] h-[189px] top-[-43px] right-[-24px] lg:w-[220px] lg:h-[193px] lg:top-[26px] lg:right-[14px] xl:w-[276px] xl:h-[240px] xl:top-0 xl:right-[-8px] lg:group-hover:top-[60px] xl:group-hover:top-[40px]  bg-[url(https://cdn.tmrwdao.com/assets/imgs/EB6FCA883065.webp)] bg-cover transition-[top] duration-300"></div>
                <h2 className="mb-[23px] lg:mb-[19px] font-Unbounded lg:group-hover:mb-[23px] text-[20px] font-light text-white lg:text-[19.2px] xl:text-[24px] transition-[margin] duration-500">
                  Treasury Governance
                </h2>
                <p className="m-0 text-[14px] lg:text-[13px] font-Montserrat xl:text-[16px] font-normal text-white leading-[160%] overflow-hidden transition-[max-height,margin] duration-500 lg:max-h-0 lg:group-hover:max-h-[150px]">
                  Deposit into your DAO’s treasury and use funds to fuel growth. Proposals are
                  required for withdrawals, keeping financial decisions transparent and aligned.
                </p>
              </div>
            </div>
          </section>

          <section className="py-[40px] md:py-[55px] lg:py-[118.4px] xl:py-[148px]">
            <h2 className="mt-0 mb-[42px] text-[24px] font-Unbounded font-light text-white text-center lg:mb-[45px] lg:text-[38.4px] xl:mb-[56px] xl:text-[48px] tracking-[-0.48px] lg:tracking-[-0.78px] xl:tracking-[-0.96px]">
              Type of DAOs
            </h2>

            <div className="flex flex-col gap-[19px] md:flex-row lg:gap-[20px] xl:gap-[32px]">
              <div className="flex flex-col items-start justify-between h-[164px] px-[22px] box-border py-[12.77px] bg-mainColor rounded-[7px] md:flex-1 lg:p-[26px] lg:h-[180px] xl:p-[32px] xl:h-[225px]">
                <h4 className="m-0 text-[20px] font-Unbounded font-light text-white tracking-[-0.21px] lg:tracking-[-0.21px] xl:tracking-[-0.26px]">
                  Multisig-based DAO
                </h4>
                <p className="m-0 text-[14px] font-Montserrat font-normal text-white leading-[160%]">
                  In token-based DAOs, If you want certain proposals to be voted on only by members
                  you can add and manage the members of the DAO&apos;s High Council.
                </p>
              </div>

              <div className="flex flex-col items-start justify-between h-[164px] px-[22px] box-border py-[12.77px] bg-mainColor rounded-[7px] md:flex-1 lg:p-[26px] lg:h-[180px] xl:p-[32px] xl:h-[225px]">
                <h4 className="m-0 text-[20px] font-Unbounded font-light text-white tracking-[-0.21px] lg:tracking-[-0.21px] xl:tracking-[-0.26px]">
                  Token-based DAO
                </h4>
                <p className="m-0 text-[14px] font-Montserrat font-normal text-white leading-[160%]">
                  Users who hold governance tokens can participate in the DAO&apos;s governance by
                  voting on proposals.
                </p>
              </div>
            </div>
          </section>

          <section className="py-[40px] md:py-[55px] lg:py-[41.6px] xl:py-[52px]">
            <div className="flex flex-col md:items-stretch md:flex-row">
              <div className="relative md:flex-1">
                <div className="sticky top-0 left-0 flex items-center w-full md:h-screen">
                  <div className="md:pr-[64px] md:flex-1 w-full lg:pr-[76px] xl:pr-[78px]">
                    <h2 className="mt-0 mb-[30px] text-[24px] font-Unbounded font-light text-white text-left whitespace-pre-wrap lg:mb-[45px] lg:text-[38.4px] xl:mb-[56px] xl:text-[48px] tracking-[-0.48px] lg:tracking-[-3px] xl:tracking-[-3.84px]">
                      {`Create in just 3 \nsimple steps.`}
                    </h2>
                    <p className="mb-0 text-[14px] font-Unbounded font-normal text-white text-right md:mb-[36px] lg:mb-[33px] lg:text-[12px] xl:mb-[42px] xl:text-[15px] tracking-[-0.56px] lg:tracking-[-0.48px] xl:tracking-[-0.6px]">
                      /It is just that easy!
                    </p>
                    <Link
                      href="/"
                      className="primary-button items-center gap-[10px] hidden md:inline-flex"
                    >
                      Create DAO
                      <LinkIcon className="h-[11px] w-[11px]" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="relative md:flex-1 md:h-[900vh]">
                <div className="sticky top-0 left-0 flex items-center md:h-screen">
                  <div className="flex flex-row items-center w-full mt-[30px] md:mt-0 md:flex-1 md:h-[287px] lg:h-[363px] xl:h-[454px]">
                    <Swiper
                      currentIndex={swiperIndex}
                      className="md:!h-[287px] lg:!h-[363px] xl:!h-[454px]"
                    >
                      <Swiper.Item>
                        <div className="relative w-full h-[287px] lg:h-[363px] xl:h-[454px] flex flex-col items-start justify-between px-[28px] py-[22px] lg:pt-[30px] lg:pb-[35px] lg:px-[35px] bg-darkGray rounded-[7px] box-border">
                          <img
                            className="absolute w-auto h-[134px] top-[51px] right-[24px] md:top-[40px] md:right-[40px] lg:h-[170px] lg:top-[51px] lg:right-[45px] xl:h-[212.6px] xl:top-[64px] xl:right-[55px]"
                            src="https://cdn.tmrwdao.com/assets/imgs/B5650D5FCE2B.webp"
                            alt=""
                          />
                          <p className="m-0 text-white font-Unbounded font-light text-[12px]">
                            STEP 1
                          </p>

                          <div className="">
                            <h3 className="mt-0 mb-0 text-[18px] lg:text-[19px] xl:text-[24px] font-Unbounded font-light text-white whitespace-pre-wrap">{`Select & create \ntype Of DAO`}</h3>
                            <p className="mt-[17px] lg:mt-[22px] xl:mt-[27px] mb-0 leading-[1.6] text-[14px] lg:text-[12.8px] xl:text-[16px] font-Montserrat font-normal text-white text-left whitespace-pre-wrap lg:whitespace-normal">{`Select an issued token or NFT as the \ngovernance token, or choose some \nusers as DAO members.`}</p>
                          </div>
                        </div>
                      </Swiper.Item>
                      <Swiper.Item>
                        <div className="relative w-full h-[287px] lg:h-[363px] xl:h-[454px] flex flex-col items-start justify-between px-[28px] py-[22px] lg:pt-[30px] lg:pb-[35px] lg:px-[35px] bg-darkGray rounded-[7px] box-border">
                          <img
                            className="absolute w-auto h-[151px] top-[25px] right-[16px] md:top-[45px] md:right-[22px] lg:h-[182px] lg:top-[34px] lg:right-[28px] xl:h-[239px] xl:top-[40px] xl:right-[36px]"
                            src="https://cdn.tmrwdao.com/assets/imgs/A33A05660253.webp"
                            alt=""
                          />
                          <p className="m-0 text-white font-Unbounded font-light text-[12px]">
                            STEP 2
                          </p>

                          <div className="">
                            <h3 className="mt-0 mb-0 text-[18px] lg:text-[19px] xl:text-[24px] font-Unbounded font-light text-white whitespace-pre-wrap">{`Govern through \nproposals`}</h3>
                            <p className="mt-[17px] lg:mt-[22px] xl:mt-[27px] mb-0 leading-[1.6] text-[14px] lg:text-[12.8px] xl:text-[16px] font-Montserrat font-normal text-white text-left whitespace-pre-wrap lg:whitespace-normal">{`After creating a proposal, use tokens, NFTs, or become a DAO member to \nvote.`}</p>
                          </div>
                        </div>
                      </Swiper.Item>
                      <Swiper.Item>
                        <div className="relative w-full h-[319px] lg:h-[363px] xl:h-[454px] flex flex-col items-start justify-between px-[28px] py-[22px] lg:pt-[30px] lg:pb-[35px] lg:px-[35px] bg-darkGray rounded-[7px] box-border">
                          <img
                            className="absolute w-auto h-[134px] top-[19px] right-[24px] md:top-[40px] md:right-[40px] lg:h-[170px] lg:top-[51px] lg:right-[45px] xl:h-[212.6px] xl:top-[64px] xl:right-[55px]"
                            src="https://cdn.tmrwdao.com/assets/imgs/8F08514716C0.webp"
                            alt=""
                          />
                          <p className="m-0 text-white font-Unbounded font-light text-[12px]">
                            STEP 3
                          </p>

                          <div className="">
                            <h3 className="mt-0 mb-0 text-[18px] lg:text-[19px] xl:text-[24px] font-Unbounded font-light text-white whitespace-pre-wrap">{`Fund & allocate \nthe treasury`}</h3>
                            <p className="mt-[17px] lg:mt-[22px] xl:mt-[27px] mb-0 leading-[1.6] text-[14px] lg:text-[12.8px] xl:text-[16px] font-Montserrat font-normal text-white text-left whitespace-pre-wrap lg:whitespace-normal">{`Deposit funds to your DAO's treasury \nand govern your DAO by allocating \nthese funds.`}</p>
                          </div>
                        </div>
                      </Swiper.Item>
                    </Swiper>

                    <div className="hidden ml-[15px] md:block lg:ml-[13.6px] xl:ml-[17px] relative w-[3px] h-[60%] bg-darkGray rounded-[2px]">
                      <div
                        className="absolute w-full bg-mainColor rounded-[2px]"
                        style={{ height: `${scrollPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center mt-[30px] md:hidden">
              <Link href="/" className="primary-button items-center gap-[10px] inline-flex">
                Create DAO
                <LinkIcon className="h-[11px] w-[11px]" />
              </Link>
            </div>
          </section>

          <section className="py-[40px] md:py-[55px] lg:py-[80px] xl:py-[100px]">
            <div className="flex flex-col md:flex-row">
              <div className="flex flex-col md:pr-[64px] md:flex-1 lg:pr-[76px] xl:pr-[78px]">
                <h2 className="mt-0 mb-[30px] text-[24px] font-Unbounded font-light text-white text-left lg:mb-[16px] lg:text-[38.4px] xl:mb-[21px] xl:text-[48px] tracking-[-0.48px] lg:tracking-[-3px] xl:tracking-[-3.84px]">
                  AI Driven DAO
                </h2>
                <p className="mt-0 mb-[30px] text-[14px] font-Unbounded font-normal text-white text-right md:mb-[100px] lg:mb-[56px] lg:text-[12px] xl:mb-[70px] xl:text-[15px] tracking-[-0.56px] lg:tracking-[-0.48px] xl:tracking-[-0.6px]">
                  /For smarter community
                </p>
                <img
                  className="w-[207px] h-[203px] object-cover object-center lg:w-[179px] lg:h-[176px] xl:w-[224px] xl:h-[220px]"
                  src="https://cdn.tmrwdao.com/assets/imgs/3996DAE19A7E.webp"
                  alt=""
                />
              </div>

              <div className="mt-[30px] md:mt-0 md:flex-1">
                <Collapse defaultActiveKey={['2', '3']} items={collapseItems} />
              </div>
            </div>
          </section>

          <section className="py-[60px] lg:py-[67px] xl:py-[84px]">
            <div className="flex flex-col gap-[20px] md:gap-[25px] md:flex-row bg-mainColor py-[21px] px-[22px] rounded-[12px] xl:p-[32px] md:items-stretch">
              <div className="w-full md:flex-1">
                <h2 className="mt-0 mb-0 text-[24px] font-Unbounded font-light text-white text-left lg:text-[38.4px] xl:text-[48px] leading-[1] tracking-[-0.48px] lg:tracking-[-0.78px] xl:tracking-[-0.96px]">
                  Network DAO
                </h2>
                <p className="mt-[10px] mb-[74px] text-[14px] font-Unbounded font-light text-white text-right whitespace-pre-wrap md:mb-[80px] lg:mb-[102px] lg:text-[12px] xl:mb-[134px] xl:text-[15px] tracking-[-0.56px] lg:tracking-[-0.48px] xl:tracking-[-0.6px]">
                  {`/Where Innovation Meets Security\n in the Web3 Space`}
                </p>
                <p className="mt-0 mb-[12px] lg:mb-[19px] xl:mb-[24px] text-[14px] font-Montserrat font-normal text-white text-left whitespace-pre-wrap lg:whitespace-normal lg:pr-[88px] xl:pr-[112px] lg:text-[12px] xl:text-[15px]">
                  {`Vote with or delegate your ELF tokens to \nhelp protect the integrity of the AELF \nprotocol.`}
                </p>
                <Link href="/" className="default-button inline-flex items-center gap-[10px]">
                  Find out more
                  <LinkIcon className="h-[11px] w-[11px]" />
                </Link>
              </div>

              <div className="w-full md:flex-1">
                <img
                  className="w-full h-[199px] lg:h-[270px] object-cover object-center rounded-[12px] md:h-[265px] lg:h-[278.58px] xl:h-[348.22px] align-top"
                  src={require('assets/revamp-imgs/NetworkDAO.gif').default.src}
                  alt=""
                />
              </div>
            </div>
          </section>

          <section className="py-[100px] lg:pt-[210px] lg:pb-[160px] xl:pt-[263px] xl:pb-[200px]  text-center flex flex-col md:bg-[url(https://cdn.tmrwdao.com/assets/imgs/05C02F412414.webp)] md:bg-[length:72%_auto] lg:bg-[length:86%_auto] xl:bg-[length:78%_auto] bg-no-repeat bg-center">
            <span className="mb-6 text-[14px] font-Unbounded font-light text-white text-center lg:mb-[17px] lg:text-[12px] xl:mb-[22px] xl:text-[15px] tracking-[-0.56px] lg:tracking-[-0.48px] xl:tracking-[-0.6px]">
              Join the movement:
            </span>
            <span className="m-0 text-[36px] font-Unbounded font-light text-white text-center whitespace-pre-wrap md:whitespace-normal lg:text-[52.8px] xl:text-[66px] tracking-[-2.88px] lg:tracking-[-4.32px] xl:tracking-[-5.28px]">
              {`Be a part of&nbsp;\n`}
              <span className="text-mainColor font-Unbounded">TmrwDAO&apos;</span>s
            </span>
            <span className="m-0 text-[36px] font-Unbounded font-light text-white text-center whitespace-pre-wrap md:whitespace-normal lg:text-[52.8px] xl:text-[66px] tracking-[-2.88px] lg:tracking-[-4.32px] xl:tracking-[-5.28px]">{`Community \nTransformation`}</span>
            <div className="flex align-center justify-center mt-[35px] md:mb-[20px] xl:mb-[63px] lg:mt-[48.8px] xl:mt-[61px] text-white">
              <Link href="/" className="group">
                <ArrowSymbolIcon className="h-[39px] w-[39.83px] inline-block group-hover:hidden transition-[display] duration-300" />
                <ArrowFilledIcon className="h-[39px] w-[39.83px] hidden group-hover:inline-block transition-[display] duration-300" />
              </Link>
            </div>
          </section>
        </div>
      </div>

      <div className="bg-mainColor pt-[60px] pb-[55px] lg:py-[100.8px] xl:py-[126px]">
        <div className="tmrwdao-grid">
          <div className="col-12 box-border">
            <div className="flex flex-row justify-between items-end">
              <h2 className="m-0 text-[24px] lg:text-[38.4px] xl:text-[48px] font-Unbounded font-light text-white whitespace-pre-wrap leading-[1] tracking-[-0.48px] lg:tracking-[-0.78px] xl:tracking-[-0.96px]">{`Built on the aelf \necosystem`}</h2>

              <Link
                href="/"
                className="default-button hidden items-center gap-[10px] md:inline-flex"
              >
                About aelf
                <LinkIcon className="h-[11px] w-[11px]" />
              </Link>
            </div>
          </div>

          <div className="col-12 box-border">
            <div className="flex flex-row gap-[12px] lg:gap-[20px] overflow-x-auto py-[36px] md:py-[33px] lg:py-[40px] xl:py-[50px] lg:overflow-x-hidden mr-[-1.25rem] md:mr-[-2.5rem] lg:mr-0">
              <div className="relative group py-[26px] px-[28px] w-[335px] h-[295px] flex flex-col items-start shrink-0 justify-end rounded-[12px] overflow-hidden lg:rounded-r-none box-border lg:bg-fillBlack15 lg:hover:bg-transparent lg:flex-1 lg:h-[241px] xl:h-[301px]">
                <div className="absolute top-0 right-0 bottom-0 left-0 transition-[opacity] duration-300 bg-aelfItemShadow opacity-100 lg:opacity-0 lg:group-hover:opacity-100"></div>
                <div className="absolute top-[29px] right-[22px] w-[124.718px] h-[95px] lg:top-[22px] lg:right-[22px] lg:w-[110px] lg:h-[83px] xl:w-[137px] xl:h-[104px] xl:top-[28px] xl:right-[26px] transition-[opacity] duration-300 bg-[url(https://cdn.tmrwdao.com/assets/imgs/76FE650ED476.webp)] bg-no-repeat bg-cover lg:opacity-0 lg:group-hover:opacity-100"></div>
                <h4 className="m-0 text-[20px] font-Unbounded font-normal text-white whitespace-pre-wrap lg:text-[16px] xl:text-[20px]">{`AI-powered \nOperational Efficiency`}</h4>
                <p className="mt-[23px] mb-0 text-[14px] font-Montserrat font-normal text-white text-left lg:mt-[16px] lg:text-[12.8px] xl:mt-[20px] xl:text-[16px] opacity-70">
                  In consensus and smart contract execution, boosting scalability and reducing
                  resource use.
                </p>
              </div>
              <div className="relative group py-[26px] px-[28px] w-[335px] h-[295px] flex flex-col items-start shrink-0 justify-end rounded-[12px] overflow-hidden lg:rounded-none box-border lg:bg-fillBlack15 lg:hover:bg-transparent lg:flex-1 lg:h-[241px] xl:h-[301px]">
                <div className="absolute top-0 right-0 bottom-0 left-0 transition-[opacity] duration-300 bg-aelfItemShadow opacity-100 lg:opacity-0 lg:group-hover:opacity-100"></div>
                <div className="absolute top-[29px] right-[22px] w-[124.718px] h-[95px] lg:top-[22px] lg:right-[22px] lg:w-[110px] lg:h-[83px] xl:w-[137px] xl:h-[104px] xl:top-[28px] xl:right-[26px] transition-[opacity] duration-300 bg-[url(https://cdn.tmrwdao.com/assets/imgs/B0D7D235602A.webp)] bg-no-repeat bg-cover opacity-100 lg:opacity-0 lg:group-hover:opacity-100"></div>
                <h4 className="m-0 text-[20px] font-Unbounded font-normal text-white whitespace-pre-wrap lg:text-[16px] xl:text-[20px]">{`Zero Gas Fees`}</h4>
                <p className="mt-[23px] mb-0 text-[14px] font-Montserrat font-normal text-white text-left lg:mt-[16px] lg:text-[12.8px] xl:mt-[20px] xl:text-[16px] opacity-70">
                  {`Aelf's zero Gas fee structure allows \nusers to participate in our projects \nmore easily and cost-effectively.`}
                </p>
              </div>
              <div className="relative group py-[26px] px-[28px] w-[335px] h-[295px] flex flex-col items-start shrink-0 justify-end rounded-[12px] overflow-hidden lg:rounded-l-none box-border lg:bg-fillBlack15 lg:hover:bg-transparent lg:flex-1 lg:h-[241px] xl:h-[301px]">
                <div className="absolute top-0 right-0 bottom-0 left-0 transition-[opacity] duration-300 bg-aelfItemShadow opacity-100 lg:opacity-0 lg:group-hover:opacity-100"></div>
                <div className="absolute top-[29px] right-[22px] w-[124.718px] h-[95px] lg:top-[22px] lg:right-[22px] lg:w-[110px] lg:h-[83px] xl:w-[137px] xl:h-[104px] xl:top-[28px] xl:right-[26px] transition-[opacity] duration-300 bg-[url(https://cdn.tmrwdao.com/assets/imgs/ACFD1295C8DA.webp)] bg-no-repeat bg-cover opacity-100 lg:opacity-0 lg:group-hover:opacity-100"></div>
                <h4 className="m-0 text-[20px] font-Unbounded font-normal text-white whitespace-pre-wrap lg:text-[16px] xl:text-[20px]">{`Flexible Architecture`}</h4>
                <p className="mt-[23px] mb-0 text-[14px] font-Montserrat font-normal text-white text-left lg:mt-[16px] lg:text-[12.8px] xl:mt-[20px] xl:text-[16px] opacity-70">
                  {`Modular design offers a tailored \ndevelopment environment via \ncustom sidechains.`}
                </p>
              </div>
            </div>

            <div className="flex flex-row items-center justify-center mb-[35px] md:hidden">
              <Link href="/" className="default-button inline-flex items-center gap-[10px]">
                About aelf
                <LinkIcon className="h-[11px] w-[11px]" />
              </Link>
            </div>
          </div>

          <div className="col-12 box-border">
            <div className="flex flex-row justify-center flex-wrap lg:px-[164px] xl:px-[200px]">
              <PortkeyIcon className="w-[83.75px] h-[36px] lg:w-[139.5px] lg:h-[60px] xl:w-[175px] xl:h-[75px]" />
              <SchordingerIcon className="w-[83.75px] h-[36px] lg:w-[139.5px] lg:h-[60px] xl:w-[175px] xl:h-[75px]" />
              <AwakenIcon className="w-[83.75px] h-[36px] lg:w-[139.5px] lg:h-[60px] xl:w-[175px] xl:h-[75px]" />
              <BridgeIcon className="w-[83.75px] h-[36px] lg:w-[139.5px] lg:h-[60px] xl:w-[175px] xl:h-[75px]" />
              <EtransferIcon className="w-[83.75px] h-[36px] lg:w-[139.5px] lg:h-[60px] xl:w-[175px] xl:h-[75px]" />
              <BeangoIcon className="w-[83.75px] h-[36px] lg:w-[139.5px] lg:h-[60px] xl:w-[175px] xl:h-[75px]" />
              <ForestIcon className="w-[83.75px] h-[36px] lg:w-[139.5px] lg:h-[60px] xl:w-[175px] xl:h-[75px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="tmrwdao-grid py-[100px] lg:py-[67px] xl:py-[126px]">
        <div className="col-12 box-border mb-[30px] lg:mb-[43px] xl:mb-[50px]">
          <div className="flex flex-row justify-between items-center">
            <h2 className="m-0 text-[24px] lg:text-[20.8px] xl:text-[26px] font-Unbounded font-light text-white whitespace-pre-wrap tracking-[-0.21px] lg:tracking-[-0.21px] xl:tracking-[-0.26px]">
              Recent Updates
            </h2>

            <Link href="/" className="default-button hidden items-center gap-[10px] lg:inline-flex">
              View More
              <LinkIcon className="h-[11px] w-[11px]" />
            </Link>
          </div>
        </div>

        {posts.map(({ title, description, img, date }, index) => (
          <div className="col-12 mb-[25px] md:col-6 lg:col-4" key={index}>
            <div className="flex flex-col">
              <img
                className="w-[100%] h-[190px] lg:h-[162px] xl:h-[203px] object-fill object-center rounded-[12px] mb-[15px] lg:mb-[12.8px] xl:mb-[16px]"
                src={img}
                alt=""
              />
              <p className="m-0 text-lightGrey text-[12px] font-Montserrat font-normal whitespace-pre-wrap md:text-[10px] lg:text-[12px] xl:text-[14px]">
                {date}
              </p>
              <p className="mt-1 mb-0 heigh-[36px] overflow-hidden line-clamp-2 text-overflow-ellipsis text-[13px] font-Montserrat font-normal text-white whitespace-pre-wrap lg:h-[32px] xl:h-[40px] lg:text-[11.2px] xl:text-[14px]">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <NavFooter />
    </>
  );
};

export default Page;
