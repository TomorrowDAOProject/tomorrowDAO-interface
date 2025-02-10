import Image from 'next/image';
import HeaderLogoIcon from 'assets/imgs/header-logo.svg';
import FooterLogoIcon from 'assets/imgs/footer-logo.svg';

function HeaderLogo() {
  return <Image width={150} height={40} src={HeaderLogoIcon} alt="" />;
}

function FooterLogo() {
  return <Image width={150} height={48} src={FooterLogoIcon} alt="" />;
}

export { HeaderLogo, FooterLogo };
