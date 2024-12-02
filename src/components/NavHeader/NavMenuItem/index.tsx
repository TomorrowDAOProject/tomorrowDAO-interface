import Dropdown from 'components/Dropmenu';
import { MenuItem } from '..';

const NavMenuItem = ({ item }: { item: MenuItem }) => {
  return (
    <div key={item?.key}>
      {item?.children?.length ? (
        <Dropdown menu={item.children}>
          <a onClick={(e) => e.preventDefault()}>
            <span className="text-[15px] font-medium text-white no-underline font-Montserrat m-[8px]">
              {item.label}
            </span>
          </a>
        </Dropdown>
      ) : (
        item?.label
      )}
    </div>
  );
};

export default NavMenuItem;
