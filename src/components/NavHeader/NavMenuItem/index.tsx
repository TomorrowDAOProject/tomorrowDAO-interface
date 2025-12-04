import Dropdown from 'components/Dropmenu';
import { MenuItem } from '..';
import { Fragment } from 'react';

const NavMenuItem = ({ item }: { item: MenuItem }) => {
  return (
    <Fragment key={item?.key}>
      {item?.children?.length ? (
        <Dropdown menu={item.children}>
          <div
            onClick={(e) => e.preventDefault()}
            className="text-[15px] font-medium text-white no-underline font-Montserrat hover:text-mainColor"
          >
            <span className="text-[15px] font-medium text-white no-underline font-Montserrat m-[8px]">
              {item.label}
            </span>
          </div>
        </Dropdown>
      ) : (
        item?.label
      )}
    </Fragment>
  );
};

export default NavMenuItem;
