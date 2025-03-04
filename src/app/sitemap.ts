import { fetchDaoList, fetchProposalList } from 'api/request';
import { curChain, networkType } from 'config';
import type { MetadataRoute } from 'next';

const maxResultCount = networkType === 'TESTNET' ? 5 : 18;
const networkDaoAlias = 'network-dao';
const networkDAOSitemap: MetadataRoute.Sitemap = [
  {
    url: 'https://tmrwdao.com/network-dao',
  },
  {
    url: 'https://tmrwdao.com/network-dao/organization',
  },
  {
    url: 'https://tmrwdao.com/network-dao/vote/election',
  },
  {
    url: 'https://tmrwdao.com/network-dao/apply',
  },
  {
    url: 'https://tmrwdao.com/network-dao/resource',
  },
];
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tmrwSiteMap: MetadataRoute.Sitemap = [];
  let daoLists: IDaoItem[] = [];
  try {
    const [daoListRes1, daoListRes2] = await Promise.all([
      fetchDaoList({
        skipCount: 0,
        maxResultCount: maxResultCount,
        chainId: curChain,
        daoType: 0,
      }),
      fetchDaoList({
        skipCount: 0,
        maxResultCount: maxResultCount,
        chainId: curChain,
        daoType: 1,
      }),
    ]);
    daoLists = [...daoListRes1.data.items, ...daoListRes2.data.items];
  } catch (error) {
    //
  }
  for (const daoItem of daoLists) {
    const aliasName = daoItem.alias;
    if (aliasName === networkDaoAlias) {
      continue;
    }
    const currentDaoSiteMap: MetadataRoute.Sitemap = [
      {
        url: `https://tmrwdao.com/dao/${aliasName}`,
      },
      {
        url: `https://tmrwdao.com/dao/${aliasName}/treasury`,
      },
    ];
    tmrwSiteMap.push(...currentDaoSiteMap);
    try {
      const proposalList = await fetchProposalList({
        chainId: curChain,
        maxResultCount: 10,
        skipCount: 0,
        alias: aliasName,
      });
      for (const proposalItem of proposalList.data.items) {
        tmrwSiteMap.push({
          url: `https://tmrwdao.com/dao/${aliasName}/proposal/${proposalItem.proposalId}`,
        });
      }
    } catch (error) {
      //
    }
  }
  return [
    {
      url: 'https://tmrwdao.com',
      changeFrequency: 'weekly',
    },
    {
      url: 'https://tmrwdao-docs-testnet.aelf.dev/',
      changeFrequency: 'weekly',
    },
    {
      url: 'https://blog.tmrwdao.com',
      changeFrequency: 'weekly',
    },
    {
      url: 'https://tmrwdao.com/create',
      changeFrequency: 'weekly',
    },
    {
      url: 'https://tmrwdao.com/explore',
      changeFrequency: 'weekly',
    },
    ...tmrwSiteMap,
    ...networkDAOSitemap,
  ];
}
