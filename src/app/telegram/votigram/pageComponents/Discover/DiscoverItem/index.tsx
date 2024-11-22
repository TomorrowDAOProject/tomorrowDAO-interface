import React, { MutableRefObject, useRef } from 'react';
import { Button } from 'aelf-design';
import { Tag } from 'antd';
import CommonDrawer, { ICommonDrawerRef } from '../../../components/CommonDrawer';
import './index.css';
import AppDetail from '../AppDetail';
import ImageWithPlaceholder from 'components/ImageSkeleton';
import useInViewport from 'hooks/useInViewport';
import { ETelegramAppCategory } from 'app/telegram/votigram/type';

interface IDiscoverProps {
  category: string;
  item: IDiscoverAppItem;
  onBannerView: (alias: string) => void;
}
export default function DiscoverItem(props: IDiscoverProps) {
  const { item, category, onBannerView } = props;
  const itemRef = useRef<HTMLDivElement>(null);
  const itemViewRef = useRef(item.viewed);
  useInViewport(itemRef, undefined, () => {
    if (category === ETelegramAppCategory.New && !item.viewed && !itemViewRef.current) {
      itemViewRef.current = true;
      onBannerView(item.alias);
    }
  });
  const detailDrawerRef = useRef<ICommonDrawerRef>(null);
  const aHrefRef = useRef<HTMLAnchorElement>(null);
  const handleItemOpen: React.MouseEventHandler = (e) => {
    if (aHrefRef.current?.contains(e.target as any)) return;
    console.log(e);
    detailDrawerRef.current?.open();
  };

  return (
    <>
      <div ref={itemRef} className="discover-item-wrap" onClick={handleItemOpen}>
        <div className="header grid-cols-[48px_auto]">
          <img src={item.icon} className="icon" alt="" width={48} />
          <div className="title-wrap">
            <h3 className="text-[16px] font-medium leading-[24px]">{item.title}</h3>
            <div className="tag-wrap">
              {item.categories?.map((category, index) => (
                <Tag key={index}>{category}</Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CommonDrawer
        title=""
        ref={detailDrawerRef}
        showCloseTarget={false}
        showLeftArrow={true}
        bodyClassname="discover-app-detail-drawer"
        rootClassName="discover-app-detail-drawer-root"
        drawerProps={{
          destroyOnClose: true,
        }}
        showCloseIcon={false}
        body={
          <div className="">
            <AppDetail item={item} />
          </div>
        }
      />
    </>
  );
}
