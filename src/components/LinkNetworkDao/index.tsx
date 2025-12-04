import { useEffect, useMemo, useState } from 'react';
import Link, { LinkProps } from 'next/link';
import { NetworkDaoHomePathName } from 'config';
import getChainIdQuery from 'utils/url';

interface ILinkReplaceLastPathNameProps extends LinkProps {
  children?: React.ReactNode;
  className?: string;
}
export default function LinkNetworkDao(props: ILinkReplaceLastPathNameProps) {
  const { href: originHref, className } = props;
  const [chainIdQuery, setChainIdQuery] = useState({});
  const newPath = useMemo(() => {
    if (typeof originHref === 'string') {
      return {
        query: chainIdQuery,
        pathname: `${NetworkDaoHomePathName}${originHref}`,
      };
    } else {
      const originQuery = typeof originHref.query === 'object' ? originHref.query : {};
      return {
        ...originHref,
        query: {
          ...originQuery,
          ...chainIdQuery,
        },
        pathname: `${NetworkDaoHomePathName}${originHref.pathname}`,
      };
    }
  }, [originHref, chainIdQuery]);
  useEffect(() => {
    const chainIdQuery = getChainIdQuery();
    setChainIdQuery({
      chainId: chainIdQuery.chainId,
    });
  }, []);
  return <Link {...props} href={newPath} className={className} />;
}
