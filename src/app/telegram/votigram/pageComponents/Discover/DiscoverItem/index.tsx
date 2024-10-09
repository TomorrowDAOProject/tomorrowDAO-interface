import React, { useRef } from 'react';
import { Button } from 'aelf-design';
import { Tag } from 'antd';
import CommonDrawer, { ICommonDrawerRef } from '../../../components/CommonDrawer';
import './index.css';
import AppDetail from '../AppDetail';

interface IDiscoverProps {
  item: IDiscoverAppItem;
}
export default function DiscoverItem(props: IDiscoverProps) {
  const { item } = props;
  const detailDrawerRef = useRef<ICommonDrawerRef>(null);
  const aHrefRef = useRef<HTMLAnchorElement>(null);
  const handleItemOpen: React.MouseEventHandler = (e) => {
    if (aHrefRef.current?.contains(e.target as any)) return;
    console.log(e);
    detailDrawerRef.current?.open();
  };
  return (
    <>
      <div className="discover-item-wrap" onClick={handleItemOpen}>
        <div className="header">
          <img src={item.icon} className="icon" alt="" width={48} />
          <div className="title-wrap">
            <h3 className="font-16-20-weight">{item.title}</h3>
            <div className="tag-wrap">
              {item.categories?.map((category, index) => (
                <Tag key={index}>{category}</Tag>
              ))}
            </div>
          </div>
          <a
            href={item.url}
            ref={aHrefRef}
            target="_blank"
            rel="noopener noreferrer"
            className="button-wrap"
          >
            <Button size="small">Open</Button>
          </a>
        </div>
        {item.screenshots?.[0] && <img src={item.screenshots[0]} alt="" className="cover-image" />}
        <p className="description">{item.description}</p>
      </div>
      <CommonDrawer
        title="app details"
        ref={detailDrawerRef}
        showCloseTarget={false}
        showLeftArrow={true}
        bodyClassname="discover-app-detail-drawer"
        rootClassName="discover-app-detail-drawer-root"
        drawerProps={{
          destroyOnClose: true,
        }}
        body={
          <div className="">
            <AppDetail item={item} />
          </div>
        }
      />
    </>
  );
}