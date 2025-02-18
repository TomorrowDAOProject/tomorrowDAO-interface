import Image from 'next/image';
import HeaderLogoIcon from 'assets/revamp-icon/network-logo.svg';
import FooterLogoIcon from 'assets/revamp-icon/network-logo.svg';

function HeaderLogo() {
  return <Image width={25} height={25} src={HeaderLogoIcon} alt="" />;
}

function FooterLogo() {
  return <Image width={18} height={18} src={FooterLogoIcon} alt="" />;
}

export { HeaderLogo, FooterLogo };
