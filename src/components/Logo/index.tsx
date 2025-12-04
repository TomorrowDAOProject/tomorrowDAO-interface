import Image from 'next/image';
import HeaderLogoAllIcon from 'assets/revamp-icon/network-logo-all.svg';
import HeaderLogoIcon from 'assets/revamp-icon/network-logo.svg';

import FooterLogoIcon from 'assets/revamp-icon/network-logo.svg';

function HeaderLogo(props: { isSmall?: boolean }) {
  const { isSmall } = props;
  return (
    <Image
      width={isSmall ? 18 : 117}
      height={isSmall ? 18 : 19}
      src={isSmall ? HeaderLogoIcon : HeaderLogoAllIcon}
      alt=""
    />
  );
}

function FooterLogo() {
  return <Image width={18} height={18} src={FooterLogoIcon} alt="" />;
}

export { HeaderLogo, FooterLogo };
