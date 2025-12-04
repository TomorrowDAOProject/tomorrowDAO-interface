/* eslint-disable @next/next/inline-script-id */
'use client';

import Script from 'next/script';

export default function VconsoleScript() {
  return (
    <Script>
      {`
      function main() {
        var urlObj = new URL(window.location.href);
        var utmSource = urlObj.searchParams.get('utm_source');
        var utmMedium = urlObj.searchParams.get('utm_medium');
        var utmCampaign = urlObj.searchParams.get('utm_campaign');
        var utmId = urlObj.searchParams.get('utm_id');
        var utmTerm = urlObj.searchParams.get('utm_term');
        var utmContent = urlObj.searchParams.get('utm_content');

        var campaign = {};

        if (utmId) campaign.id = utmId; 
        if (utmSource) campaign.source = utmSource;
        if (utmMedium) campaign.medium = utmMedium;
        if (utmCampaign) campaign.name = utmCampaign; 
        if (utmTerm) campaign.term = utmTerm;
        if (utmContent) campaign.content = utmContent;

        if (!utmSource && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.start_param) {
            var start_param = window.Telegram.WebApp.initDataUnsafe.start_param;
            var AND_CHAR = '_';
            var CONNECT_CHAR = '-';
            const parseStartAppParams = (params) => {
                const result = {};
                const parts = params.split(CONNECT_CHAR);

                for (const part of parts) {
                    const [key, value] = part.split(AND_CHAR);
                    if (key && value !== undefined) {
                    result[key] = value;
                    }
                }
                return result;
            };
            const params = parseStartAppParams(start_param);
            if (params.source) campaign.source = params.source;
        }


        console.log('campaign params', campaign);
        if (Object.keys(campaign).length > 0) {
            gtag('set', 'campaign', campaign);
        }
      }
        try {
            main();
        } catch (e) {
            console.log('error in vconsole script', e);
        }
        `}
    </Script>
  );
}
