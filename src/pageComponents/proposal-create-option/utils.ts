export const formmatDescription = (alias: string[], bannerUrl?: string) => {
  const appAlias = bannerUrl ? alias.slice(0, -1) : alias;
  const aliasStr = appAlias.map((item) => `{${item}}`).join(',');
  const bannerAlias = bannerUrl ? alias[alias.length - 1] : null;
  const bannerStr = bannerAlias ? `#B:{${bannerAlias}}` : '';
  return `##GameRanking:${aliasStr}${bannerStr}`;
};
