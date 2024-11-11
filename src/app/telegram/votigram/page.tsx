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
          src="https://richinfo.co/richpartners/telegram/js/rp-ob.js?pub_id=947286&widget_id=353236"
          strategy="lazyOnload" // or another strategy like "afterInteractive"
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
