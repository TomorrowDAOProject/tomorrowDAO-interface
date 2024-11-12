import React from 'react';
import ConfigProvider from 'components/CmsGlobalConfig';
import Page from './_page';
import { host } from 'config';

export default async function page() {
  const cmsRes = await fetch(host + '/cms/items/config', {
    cache: 'no-store',
  });
  const cmsData = await cmsRes.json();
  if (cmsRes.ok) {
    return (
      <ConfigProvider config={cmsData.data.config}>
        <Page />
      </ConfigProvider>
    );
  }
  return <div>cms api error</div>;
}
