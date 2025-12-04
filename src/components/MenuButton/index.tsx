import { ReactComponent as MenuIcon } from 'assets/imgs/menu-icon.svg';
import './index.css';
export default function MenuButton() {
  return (
    <div className="menu-button">
      <MenuIcon width={16} height={16} />
    </div>
  );
}
