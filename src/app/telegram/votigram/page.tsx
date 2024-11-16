import React from 'react';
import ConfigProvider from 'components/CmsGlobalConfig';
import Page from './_page';
import { host } from 'config';
import Script from 'next/script';

export default async function page() {
  const cmsRes = await fetch(host + '/cms/items/config', {
    cache: 'no-store',
  });
  const cmsData = await cmsRes.json();
  if (cmsRes.ok) {
    return (
      <>
        <Script
          src="https://sad.adsgram.ai/js/sad.min.js"
          strategy="lazyOnload"
          data-cfasync="false"
          async
        />
        <ConfigProvider config={cmsData.data.config}>
          <Page />
        </ConfigProvider>
      </>
    );
  }
  return <div>cms api error</div>;
}
