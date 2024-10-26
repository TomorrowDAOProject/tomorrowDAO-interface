/* eslint-disable no-inline-styles/no-inline-styles */

import 'styles/global.css';
import 'styles/button.css';
import 'aelf-design/css';
import Provider from 'provider/';
import Script from 'next/script';
import StyleRegistry from './StyleRegistry';
import { LayoutContent } from './layout-content';
import { Metadata } from 'next';
import VconsoleScript from './VconsoleScript';
import GtagConfigScript from './GtagConfigScript';
export const metadata: Metadata = {
  title: 'TMRWDAO: Revolutionise Decentralised Governance with AI',
  description:
    'Launch & Manage Your DAO with AI: TMRWDAO, the leading AI DAO platform, empowers communities with secure, transparent & efficient decentralised governance.',
};
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"
        ></meta>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <VconsoleScript />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/js/telegram-web-app.js"></script>
        {/* Google Tag Manager  */}
        {/* eslint-disable-next-line @next/next/inline-script-id */}
        <Script>
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PSHXV7WX');
            `}
        </Script>
        {/* End Google Tag Manager */}
        {/* <link rel="shortcut icon" href="/aelfinscription/favicon.ico" /> */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-Z5LV4SE2RX"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          
            gtag('config', 'G-Z5LV4SE2RX');
          `}
        </Script>
        <GtagConfigScript />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PSHXV7WX"
            height="0"
            width="0"
            style={{
              display: 'none',
              visibility: 'hidden',
            }}
          ></iframe>
        </noscript>
        <StyleRegistry>
          <Provider>
            <LayoutContent>{children}</LayoutContent>
          </Provider>
        </StyleRegistry>
      </body>
    </html>
  );
};

export default RootLayout;
