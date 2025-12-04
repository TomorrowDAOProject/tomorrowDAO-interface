import type { MetadataRoute } from 'next';
export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/network-dao/my-proposals', '/network-dao/vote/myvote'],
    },
    sitemap: 'https://tmrwdao.com/sitemap.xml',
  };
}
