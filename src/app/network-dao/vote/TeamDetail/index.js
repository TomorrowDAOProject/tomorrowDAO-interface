import React, { PureComponent } from "react";
import LinkNetworkDao from 'components/LinkNetworkDao';
import { If, Then, Else } from "react-if";
import { Row, Col, Button, Avatar, Tag, Typography } from "antd";
import queryString from "query-string";
import StatisticalData from "@components/StatisticalData/";
import {
  getTeamDesc,
  fetchElectorVoteWithRecords,
  fetchPageableCandidateInformation,
  fetchCount,
} from "@api/vote";
import { fetchCurrentMinerPubkeyList } from "@api/consensus";
import { FROM_WALLET, ELF_DECIMAL } from "../constants";
import publicKeyToAddress from "@utils/publicKeyToAddress";
import {
  filterUserVoteRecordsForOneCandidate,
  computeUserRedeemableVoteAmountForOneCandidate,
} from "@utils/voteUtils";
import { connect } from "react-redux";
import "./index.css";
import addressFormat from '@utils/addressFormat';
import CopyButton from "@components/CopyButton/CopyButton";

const { Paragraph } = Typography;

const clsPrefix = "team-detail";

const ellipsis = { rows: 1 };

const TableItemCount = 20;

class TeamDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      candidateAddress: "",
      formattedAddress: "",
      isBP: false,
      rank: "-",
      terms: "-",
      totalVotes: "-",
      votedRate: "-",
      producedBlocks: "-",
      userRedeemableVoteAmountForOneCandidate: 0,
      hasAuth: false,
      isCandidate: true,
    };
  }
  getTeamPubkey() {
    const teamPubkey = queryString.parse(window.location.search).pubkey;
    return teamPubkey;
  }

  componentDidMount() {
    const teamPubkey = this.getTeamPubkey();
    const { consensusContract, electionContract, currentWallet } = this.props;

    this.fetchData();

    if (consensusContract) {
      this.justifyIsBP();
    }

    if (currentWallet?.address && electionContract) {
      this.fetchDataFromElectionContract();
    }

    if (currentWallet?.address) {
      this.setState({
        hasAuth: currentWallet?.publicKey === teamPubkey,
      });
    }
  }

  componentDidUpdate(prevProps) {
    const teamPubkey = this.getTeamPubkey();
    const { consensusContract, electionContract, currentWallet } = this.props;

    if (consensusContract !== prevProps.consensusContract) {
      this.justifyIsBP();
    }
    if (currentWallet?.address && electionContract) {
      this.fetchDataFromElectionContract();
    }

    if (prevProps.currentWallet !== currentWallet) {
      this.setState(
        {
          hasAuth: currentWallet?.publicKey === teamPubkey,
        },
        this.fetchCandidateInfo
      );
    }
  }

  fetchData() {
    const teamPubkey = this.getTeamPubkey();
    getTeamDesc(teamPubkey)
      .then((res) => {
        if (res.code !== 0) {
          return;
        }
        const { data } = res;
        const formattedAddress = addressFormat(data.address);
        this.setState({ data, formattedAddress });
      })
      .catch((err) => {
        console.log(err)
      });
  }

  fetchDataFromElectionContract() {
    this.fetchAllCandidateInfo();
    this.fetchTheUsersActiveVoteRecords();
  }

  async fetchTotal() {
    const res = await fetchCount(this.props.electionContract, "");
    const total = res.value?.length || 0;
    return total;
  }

  async fetchAllCandidateInfo() {
    try {
      const total = await this.fetchTotal();
      const { electionContract } = this.props;
      let start = 0;
      let result = [];
      while (start <= total) {
        // eslint-disable-next-line no-await-in-loop
        const res = await fetchPageableCandidateInformation(electionContract, {
          start,
          length: TableItemCount,
        });
        result = result.concat(res.value);
        start += 20;
      }
      this.processAllCandidateInfo(result);
    } catch (e) {
      console.error(e);
    }
  }

  processAllCandidateInfo(allCandidateInfo) {
    const candidateVotesArr = allCandidateInfo
      .map((item) => item.obtainedVotesAmount)
      .sort((a, b) => b - a);
    const teamPubkey = this.getTeamPubkey();
    const currentCandidate = allCandidateInfo.find(
      (item) => item.candidateInformation.pubkey === teamPubkey
    );
    const candidateAddress = publicKeyToAddress(teamPubkey);
    const formattedAddress = addressFormat(candidateAddress);

    if (!currentCandidate) {
      this.setState({
        isCandidate: false,
        formattedAddress,
      });
      return;
    }

    const totalVoteAmount = candidateVotesArr.reduce(
      (total, current) => total + +current,
      0
    );
    const currentCandidateInfo = currentCandidate.candidateInformation;

    const rank =
      +candidateVotesArr.indexOf(currentCandidate.obtainedVotesAmount) + 1;
    const terms = currentCandidateInfo.terms.length;
    const totalVotes = currentCandidate.obtainedVotesAmount;
    const votedRate =
      totalVoteAmount === 0
        ? 0
        : ((100 * totalVotes) / totalVoteAmount).toFixed(2);
    const { producedBlocks } = currentCandidateInfo;

    this.setState({
      rank,
      terms,
      totalVotes: totalVotes / ELF_DECIMAL,
      votedRate,
      producedBlocks,
      candidateAddress,
      formattedAddress,
    });
  }

  async fetchElectorVote(currentWallet, electionContract) {
    const { publicKey, address } = currentWallet;
    let res;
    if (publicKey) {
      res = await fetchElectorVoteWithRecords(electionContract, {
        value: publicKey,
      });
    }
    if (!res) {
      res = await fetchElectorVoteWithRecords(electionContract, {
        value: address,
      });
    }
    return res || {};
  }

  fetchTheUsersActiveVoteRecords() {
    const { electionContract, currentWallet } = this.props;
    this.fetchElectorVote(currentWallet, electionContract)
      .then((res) => {
        this.computeUserRedeemableVoteAmountForOneCandidate(
          res.activeVotingRecords
        );
      })
      .catch((err) => {
        console.error("fetchTheUsersActiveVoteRecords", err);
      });
  }

  computeUserRedeemableVoteAmountForOneCandidate(
    usersActiveVotingRecords = []
  ) {
    const teamPubkey = this.getTeamPubkey();
    const userVoteRecordsForOneCandidate = filterUserVoteRecordsForOneCandidate(
      usersActiveVotingRecords,
      teamPubkey
    );
    const userRedeemableVoteAmountForOneCandidate =
      computeUserRedeemableVoteAmountForOneCandidate(
        userVoteRecordsForOneCandidate
      );
    this.setState({
      userRedeemableVoteAmountForOneCandidate,
    });
  }

  justifyIsBP() {
    const teamPubkey = this.getTeamPubkey();
    const { consensusContract } = this.props;

    fetchCurrentMinerPubkeyList(consensusContract)
      .then((res) => {
        if (res.pubkeys.indexOf(teamPubkey) !== -1) {
          this.setState({
            isBP: true,
          });
        }
      })
      .catch((err) => {
        console.error("fetchCurrentMinerPubkeyList", err);
      });
  }

  getStaticData() {
    const { rank, terms, totalVotes, votedRate, producedBlocks } = this.state;

    return {
      rank: {
        title: "Rank",
        num: rank,
      },
      terms: {
        title: "Terms",
        num: terms,
      },
      totalVotes: {
        title: "Total Vote",
        num: totalVotes,
      },
      votedRate: {
        title: "Voted Rate",
        num: `${votedRate}%`,
      },
      producedBlocks: {
        title: "Produced Blocks",
        num: producedBlocks,
      },
    };
  }

  renderTopTeamInfo() {
    const isSmallScreen = document.body.offsetWidth < 768;
    const {
      formattedAddress,
      isBP,
      userRedeemableVoteAmountForOneCandidate,
      hasAuth,
      data,
      isCandidate,
    } = this.state;

    const avatarSize = isSmallScreen ? 50 : 150;
    const getTag = () => {
      if (isBP) {
        return "BP";
      }
      if (isCandidate) {
        return "Candidate";
      }
      return "Quited";
    };
    return (
      <section className={`${clsPrefix}-header card-container`}>
        <Row>
          <Col md={18} sm={24} xs={24} className="card-container-left">
            <Row className={`${clsPrefix}-team-avatar-info`}>
              <Col md={5} sm={5} xs={5} className="team-avatar-container rounded-[12px] bg-[#D9D9D9]">
                {data.avatar ? (
                  <Avatar shape="square" className="!w-full !h-full min-w[150px] min-height-[150px]" size={avatarSize} src={data.avatar} />
                ) : (
                  <Avatar shape="square" className="!w-full !h-full min-w[150px] min-height-[150px]" size={avatarSize}>
                    U
                  </Avatar>
                )}
              </Col>
              <Col className={`${clsPrefix}-team-info`} md={18} sm={18} xs={18} offset={1}>
                <div className="flex items-center mb-[10px]">
                  <h5 className={`${clsPrefix}-node-name ellipsis !text-white !text-[15px] !font-light !font-Unbounded mr-[6px]`}>
                    {data.name ? data.name : formattedAddress}
                  </h5>
                  <Tag className="pl-[4px] !text-white !bg-mainColor border border-solid border-mainColor">{getTag()}</Tag>
                </div>
                <Paragraph ellipsis={{ rows: 1 }}>
                  <span className="text-lightGrey text-[14px] font-Montserrat mr-[4px]">Location:</span>
                  <span className="text-white text-[14px] font-Montserrat">{data.location || "-"}</span>
                </Paragraph>
                <div className="mb-[1em]">
                  <span className="text-lightGrey text-[14px] font-Montserrat mr-[4px]">Address:</span>
                  <span className="text-white text-[14px] font-Montserrat max-w-[400px] text-ellipsis !inline-block align-middle">{formattedAddress}</span>
                  <CopyButton value={formattedAddress} copyIconClassName="!text-lightGrey text-[14px] font-Montserrat" />
                </div>
                <If condition={!!data.officialWebsite}>
                  <Then>
                    <Paragraph ellipsis={ellipsis}>
                      <span className="text-lightGrey text-[14px] font-Montserrat mr-[4px]">Official Website:&nbsp;</span>
                      <span className="text-white text-[14px] font-Montserrat">
                        <a href={data.officialWebsite} target="_blank" rel="noreferrer noopener">
                          {data.officialWebsite}
                        </a>
                      </span>
                    </Paragraph>
                  </Then>
                </If>
                <If condition={!!data.mail}>
                  <Then>
                    <Paragraph ellipsis={ellipsis}>
                      <span className="text-lightGrey text-[14px] font-Montserrat mr-[4px]">Email:&nbsp;</span>
                      <span className="text-white text-[14px] font-Montserrat">
                        <a href={`mailto:${data.mail}`} target="_blank" rel="noreferrer noopener">
                          {data.mail}
                        </a>
                      </span>
                    </Paragraph>
                  </Then>
                </If>
                {hasAuth ? (
                  <Button type="primary" className="edit-btn rounded-[42px] bg-mainColor flex items-center gap-[6px] cursor-pointer hover:!text-mainColor hover:!bg-darkBg hover:border hover:border-solid hover:border-mainColor">
                    <LinkNetworkDao
                      className="text-white font-Montserrat hover:!text-mainColor"
                      href={{
                        pathname: '/vote/apply',
                        query: {
                          pubkey: this.getTeamPubkey()
                        }
                      }}
                    >
                      Edit
                    </LinkNetworkDao>
                  </Button>
                ) : null}
              </Col>
            </Row>
          </Col>
          <Col md={6} sm={24}  xs={24} className="card-container-right">
            <Button
              className="w-[80px] mb-[6px] text-center vote-btn text-white !bg-mainColor !rounded-[8px] !border border-solid !border-mainColor hover:!bg-darkBg hover:!text-mainColor hover:border hover:border-solid hover:!border-mainColor"
              type="primary"
              disabled={!isCandidate}
              data-role="vote"
              data-shoulddetectlock
              data-votetype={FROM_WALLET}
              data-nodeaddress={formattedAddress}
              data-nodename={data.name || formattedAddress}
              data-targetpublickey={this.getTeamPubkey()}
            >
              Vote
            </Button>
            <Button
              className="w-[80px] text-center !text-lightGrey !rounded-[8px] bg-transparent !border border-solid !border-lightGrey hover:!bg-darkBg hover:!text-white hover:border hover:border-solid hover:!border-white"
              data-role="redeem"
              data-shoulddetectlock
              data-nodeaddress={formattedAddress}
              data-targetpublickey={this.getTeamPubkey()}
              data-nodename={data.name}
              disabled={userRedeemableVoteAmountForOneCandidate <= 0}
            >
              Redeem
            </Button>
          </Col>
        </Row>
      </section>
    );
  }

  render() {
    const { data } = this.state;

    const staticsData = { ...this.getStaticData() };
    const topTeamInfo = this.renderTopTeamInfo();

    return (
      <section className={`${clsPrefix}`}>
        {topTeamInfo}
        <div className="team-statistical-data-container">
          <StatisticalData data={staticsData} />
        </div>
        <section className={`${clsPrefix}-intro card-container`}>
          <div className="text-white text-[13px] font-Montserrat font-medium mb-[12px]">
            Introduction
          </div>
          <div className="card-content">
            <If condition={!!data.intro}>
              <Then>
                <p className="text-lightGrey font-Montserrat">{data.intro}</p>
              </Then>
              <Else>
                <div className="vote-team-detail-empty">
                  The team didn&apos;t fill the introduction.
                </div>
              </Else>
            </If>
          </div>
        </section>
        <section className={`${clsPrefix}-social-network card-container`}>
          <div className="text-white text-[13px] font-Montserrat font-medium mb-[12px]">
            Social Network
          </div>
          <div className="card-content">
            <If condition={!!(data.socials && data.socials.length > 0)}>
              <Then>
                <div className="vote-team-detail-social-network text-lightGrey font-Montserrat">
                  {(data.socials || []).map((item) => (
                    <div className="vote-team-detail-social-network-item">
                      <span className="vote-team-detail-social-network-item-title">
                        {item.type}
                      </span>
                      <span className="vote-team-detail-social-network-item-url">
                        :&nbsp;
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {item.url}
                        </a>
                      </span>
                    </div>
                  ))}
                </div>
              </Then>
              <Else>
                <span className="vote-team-detail-empty">
                  The team didn&apos;t fill the social contacts.
                </span>
              </Else>
            </If>
          </div>
        </section>
      </section>
    );
  }
}
const mapStateToProps = (state) => {
  const { currentWallet } = state.common;
  return {
    currentWallet,
  };
};
export default connect(mapStateToProps)(TeamDetail);
