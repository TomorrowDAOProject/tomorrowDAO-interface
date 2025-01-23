'use client';
import React, { useEffect, useRef } from 'react';
import { Button } from 'aelf-design';
import { RightOutlined } from '@ant-design/icons';
import './home.css';
import Link from 'next/link';
import breadCrumb from 'utils/breadCrumb';
import { eventBus, ShowHeaderExplore } from 'utils/myEvent';
import useResponsive from 'hooks/useResponsive';

interface LinkWithRightArrowProps {
  href: string;
  children: React.ReactNode;
}
const LinkWithRightArrow = (props: LinkWithRightArrowProps) => {
  return (
    <Link target="_blank" href={props.href}>
      <div className="text-colorPrimary flex items-center mt-[16px] text-[16px] font-medium leading-[22px]">
        <span className="pr-[8px] text-[14px]">{props.children}</span> <RightOutlined />
      </div>
    </Link>
  );
};
export default function Page() {
  const exploreButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    breadCrumb.clearBreadCrumb();
  }, []);
  const { isLG } = useResponsive();
  useEffect(() => {
    const top = isLG ? 64 : 82;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          eventBus.emit(ShowHeaderExplore, false);
        } else {
          eventBus.emit(ShowHeaderExplore, true);
        }
      },
      { threshold: 0.5, rootMargin: `0px 0px ${top}px 0px` },
    );
    observer.observe(exploreButtonRef.current as Element);
    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <div className="dao-home-container">
      <div className="intro-feature-wrap">
        <div className="dao-home-intro">
          <h2>Unleash the power of smart collective action</h2>
          <p>Build your DAO with Tomorrow DAO and AI</p>
          <div className="flex" ref={exploreButtonRef}>
            <Link href="/explore" prefetch={true}>
              <Button type="primary" className="w-[152px]">
                Explore
              </Button>
            </Link>
            <Link href="/create" prefetch={true}>
              <Button className="ml-[24px] w-[152px]">Create a DAO</Button>
            </Link>
          </div>
        </div>
        <div className="feature-cards">
          <img src="/images/brand-dao.png" alt="" />
        </div>
      </div>

      <div className="help-wrap">
        <ul className="dao-desc-items">
          <li className="dao-desc-items-card">
            <h3>Create a DAO</h3>
            <p>
              Create your DAO, where you can initiate proposals and let other members vote to
              co-build your community.
            </p>
            <LinkWithRightArrow href="https://docs.tmrwdao.com/wiki/introduction//create-a-dao-on-tomorrow-dao/">
              Learn More
            </LinkWithRightArrow>
          </li>
          <li className="dao-desc-items-card dao-desc-items-card-last">
            <h3>Manage High Council</h3>
            <p>
              In token-based DAOs, If you want certain proposals to be voted on only by core
              members, you can add and manage the members of the DAO&apos;s High Council.
            </p>
          </li>
        </ul>
        <ul className="dao-desc-items">
          <li className="dao-desc-items-card">
            <h3>Create Proposals </h3>
            <p>
              In Tomorrow DAO, proposals can be created for managing funds, modifying DAO
              parameters, managing DAO members, and more.
            </p>
          </li>
          <li className="dao-desc-items-card dao-desc-items-card-last">
            <h3>Treasury Governance </h3>
            <p>
              You can directly deposit funds into the DAO&apos;s treasury, but withdrawing funds
              requires creating a proposal. Treasury funds will aid in the governance of the
              community.
            </p>
            <LinkWithRightArrow href="https://docs.tmrwdao.com/wiki/introduction/how-to-enable-and-manage-a-dao-treasury-with-tomorrow-dao/">
              Learn More
            </LinkWithRightArrow>
          </li>
        </ul>
      </div>
      <div className="feature-wrap">
        <h2>Flexible structures for different DAO types</h2>
        <ul className="feature-wrap-items">
          <li className="dao-desc-items-card">
            <h3 className="mb-[80px]">Multisig-based DAO </h3>
            <p>
              A &quot;multisig&quot; is a shared wallet, typically with two or more members
              authorizing transactions.
            </p>
            <LinkWithRightArrow href="/create">Create a Multisig-based DAO</LinkWithRightArrow>
          </li>
          <li className="dao-desc-items-card dao-desc-items-card-last">
            <h3>Token-based DAO </h3>
            <p>
              Users who hold governance tokens can participate in the DAO&apos;s governance by
              voting on proposals.
            </p>
            <LinkWithRightArrow href="/create">Create a Token-based DAO</LinkWithRightArrow>
          </li>
        </ul>
      </div>
      <div className="image-feature-wrap">
        <h2>Using Tomorrow DAO to govern your community</h2>
        <ul className="image-feature-items-wrap">
          <li className="image-feature-item revert">
            <div className="text-wrap">
              <p className="tag">STEP 1</p>
              <h3 className="title">Select a type of DAO you want to create</h3>
              <p className="desc">
                Select an issued token or NFT as the governance token, or choose some users as DAO
                members.
              </p>
            </div>
            <img src="/images/treasury-1.png" alt="" />
          </li>
          <li className="image-feature-item">
            <img src="/images/treasury-2.png" alt="" />
            <div className="text-wrap">
              <p className="tag">STEP 2</p>
              <h3 className="title">Govern through proposals</h3>
              <p className="desc">
                After creating a proposal, use tokens, NFTs, or become a DAO member to vote.
              </p>
            </div>
          </li>
          <li className="image-feature-item revert">
            <div className="text-wrap">
              <p className="tag">STEP 3</p>
              <h3 className="title">Fund and allocate the treasury</h3>
              <p className="desc">
                Deposit funds to your DAO&apos;s treasury and govern your DAO by allocating these
                funds.
              </p>
            </div>
            <img src="/images/treasury-3.png" alt="" />
          </li>
        </ul>
      </div>
      <div className="feature-wrap">
        <h2>AI-powered DAO infrastructure</h2>
        <ul className="feature-wrap-items">
          <li className="dao-desc-items-card">
            <h3 className="mb-[80px]">Al agents in DAO governance </h3>
            <ul>
              <li>Writing proposals, whitepapers, manifestos and posts</li>
              <li>Summarizing governance decisions</li>
              <li>Onboarding new members (on-chain reputation or storing of credentials)</li>
            </ul>
          </li>
          <li className="dao-desc-items-card dao-desc-items-card-last">
            <h3>Al-assisted data analysis</h3>
            <ul>
              <li>Providing analysis and insights on proposals</li>
              <li>
                Using data analytics to identify patterns of behavior or voting trends among
                members. This helps the DAO to make informed decisions about proposals or changes to
                its governance structure
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div className="image-feature-wrap">
        <h2>And more</h2>
        <ul className="image-feature-items-wrap">
          <li className="image-feature-item">
            <img src="/images/ai-logo.png" alt="" />
            <div className="text-wrap">
              <h3 className="title">Swarm Intelligence</h3>
              <p className="desc">
                Al agents can serve as connections, or liaisons, between DAOs, forming a kind of
                &quot;swarm intelligence&quot; of agents or DAOs, that can work together without the
                need for human facilitation.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
