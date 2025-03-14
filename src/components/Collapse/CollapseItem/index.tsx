import { useState } from 'react';
import { ReactComponent as LargeArrowIcon } from 'assets/revamp-icon/arrow-large.svg';
import { ItemType } from '..';

const CollapseItem = ({ item, isOpened }: { item: ItemType; isOpened?: boolean }) => {
  const [isOpen, setIsOpen] = useState(isOpened || false);

  return (
    <div
      className="group border-0 border-b-[1px] border-fillBg40 border-solid cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex flex-row items-center justify-between w-full py-[12px] lg:py-[16px] xl:py-[20px] border-b-[1px] border-fillBg40">
        <span className="block m-0 text-[16px] lg:text-[14px] xl:text-[18px] font-Montserrat font-medium text-white">
          {item.label}
        </span>

        <LargeArrowIcon
          className={`w-[14px] h-[14px] lg:w-[22px] lg:h-[22px] xl:w-[27px] xl:h-[27px] transition-[transform] ease-in-out duration-300 ${
            isOpen ? 'rotate-[-180deg]' : ''
          }`}
        />
      </div>

      <div
        className={`transition-[max-height] ease-in-out duration-300 overflow-hidden ${
          isOpen ? 'max-h-[300px]' : 'max-h-0'
        }`}
      >
        <div className="pt-[3px] pb-[7px] lg:pt-[6px] lg:pb-[10px] xl:pt-[10px] xl:pb-[15px]">
          <span className="block m-0 text-[14px] lg:text-[13px] xl:text-[16px] font-Montserrat font-normal text-white leading-[1.6]">
            {item.children}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CollapseItem;
