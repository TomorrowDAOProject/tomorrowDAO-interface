import { fetchDaoInfo } from 'api/request';
import { TBreadcrumbItem } from 'components/Breads';
import { curChain } from 'config';
type TUpdateCallBack = (items: TBreadcrumbItem[]) => void;

const homePage: TBreadcrumbItem[] = [
  {
    title: 'Home',
    href: '/',
  },
];
const explorePage: TBreadcrumbItem[] = [
  ...homePage,
  {
    title: 'Explore',
    href: '/explore',
  },
];
const createDaoPage: TBreadcrumbItem[] = [
  ...homePage,
  {
    title: 'Create a DAO',
  },
];
export const defaultDaoName = 'DAO Information';
type TBreadcrumbFn = (daoAliasName?: string, daoName?: string) => TBreadcrumbItem[];
// ------- href: /dao/:daoAliasName
const daoDetailPage: TBreadcrumbFn = (daoAliasName, daoName) => {
  return [
    ...explorePage,
    {
      title: daoName,
      href: `/dao/${daoAliasName}`,
    },
  ];
};
const createProposalPage: TBreadcrumbFn = (daoAliasName, daoName) => {
  return [
    ...(daoDetailPage(daoAliasName, daoName) ?? []),
    {
      title: 'Create a Proposal',
    },
  ];
};
const createProposalVoteOptionsPage: TBreadcrumbFn = (daoAliasName, daoName) => {
  return [
    ...(daoDetailPage(daoAliasName, daoName) ?? []),
    {
      title: 'Create a List',
    },
  ];
};
const treasuryPage: TBreadcrumbFn = (daoAliasName, daoName) => {
  return [
    ...(daoDetailPage(daoAliasName, daoName) ?? []),
    {
      title: 'Treasury',
    },
  ];
};
const membersPage: TBreadcrumbFn = (daoAliasName, daoName) => {
  return [
    ...(daoDetailPage(daoAliasName, daoName) ?? []),
    {
      title: 'Members',
    },
  ];
};
const hcMembersPage: TBreadcrumbFn = (daoAliasName, daoName) => {
  return [
    ...(daoDetailPage(daoAliasName, daoName) ?? []),
    {
      title: 'High Council',
    },
  ];
};
const myVotesPage: TBreadcrumbFn = (daoAliasName, daoName) => {
  return [
    ...(daoDetailPage(daoAliasName, daoName) ?? []),
    {
      title: 'My Votes',
    },
  ];
};
const settingPage: TBreadcrumbFn = (daoAliasName, daoName) => {
  return [
    ...(daoDetailPage(daoAliasName, daoName) ?? []),
    {
      title: 'Settings',
    },
  ];
};
const proposalInformationPage: TBreadcrumbFn = (daoAliasName, daoName) => {
  return [
    ...(daoDetailPage(daoAliasName, daoName) ?? []),
    {
      title: 'Proposal',
    },
  ];
};
interface IDaoMetaData {
  name: string;
}
class BreadCrumb {
  cacheDaoInfo: Record<string, IDaoMetaData> = {};

  getDaoName = async (daoAliasName?: string) => {
    if (!daoAliasName) return '';
    if (this.cacheDaoInfo[daoAliasName]) {
      return this.cacheDaoInfo[daoAliasName].name;
    }
    const res = await fetchDaoInfo({
      alias: daoAliasName,
      chainId: curChain,
    });
    const name = res?.data?.metadata?.name;
    this.cacheDaoInfo[daoAliasName] = {
      name,
    };
    return name;
  };
  updateBreadCrumb: TUpdateCallBack = () => {
    //
  };
  public setUpdateFunction(cb: TUpdateCallBack) {
    this.updateBreadCrumb = cb;
  }
  public updateDaoDetailPage(daoAliasName?: string, daoName?: string) {
    if (!daoAliasName) return;
    if (daoName) {
      this.cacheDaoInfo[daoAliasName] = {
        name: daoName,
      };
    } else {
      daoName = this.cacheDaoInfo[daoAliasName]?.name ?? defaultDaoName;
    }
    this.updateBreadCrumb(daoDetailPage(daoAliasName, daoName));
  }
  public async updateCreateDaoPage() {
    this.updateBreadCrumb(createDaoPage);
  }
  public async updateCreateProposalPage(daoAliasName?: string) {
    const daoName = await this.getDaoName(daoAliasName);
    this.updateBreadCrumb(createProposalPage(daoAliasName, daoName));
  }
  public async updateCreateProposalVoteOptionsPage(daoAliasName?: string) {
    const daoName = await this.getDaoName(daoAliasName);
    this.updateBreadCrumb(createProposalVoteOptionsPage(daoAliasName, daoName));
  }
  public async updateTreasuryPage(daoAliasName?: string) {
    const daoName = await this.getDaoName(daoAliasName);
    this.updateBreadCrumb(treasuryPage(daoAliasName, daoName));
  }
  public async updateMembersPage(daoAliasName?: string) {
    const daoName = await this.getDaoName(daoAliasName);
    this.updateBreadCrumb(membersPage(daoAliasName, daoName));
  }
  public async updateHcMembersPage(daoAliasName?: string) {
    const daoName = await this.getDaoName(daoAliasName);
    this.updateBreadCrumb(hcMembersPage(daoAliasName, daoName));
  }
  public async updateMyVotesPage(daoAliasName?: string) {
    const daoName = await this.getDaoName(daoAliasName);
    this.updateBreadCrumb(myVotesPage(daoAliasName, daoName));
  }
  public async updateSettingPage(daoAliasName?: string) {
    const daoName = await this.getDaoName(daoAliasName);
    this.updateBreadCrumb(settingPage(daoAliasName, daoName));
  }
  public async updateProposalInformationPage(daoAliasName?: string) {
    const daoName = await this.getDaoName(daoAliasName);
    this.updateBreadCrumb(proposalInformationPage(daoAliasName, daoName));
  }
  public async clearBreadCrumb() {
    this.updateBreadCrumb([]);
  }
}
const breadCrumb = new BreadCrumb();
export default breadCrumb;
