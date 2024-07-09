import React from 'react';
import { List, Skeleton as AntdSkeleton, Space } from 'antd';
import './index.css';

const mockContent =
  'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.';
const listData = Array.from({ length: 4 }).map((_, i) => ({
  id: i,
  content: mockContent,
  title: mockContent,
}));

const SkeletonList: React.FC = () => {
  return (
    <>
      <List
        itemLayout="vertical"
        size="large"
        dataSource={listData}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <AntdSkeleton loading={true} active>
              <List.Item.Meta title={item.title} description={item.content} />
              {item.content}
            </AntdSkeleton>
          </List.Item>
        )}
      />
    </>
  );
};
const SkeletonDaoItemList: React.FC = () => {
  return (
    <>
      <List
        itemLayout="vertical"
        size="large"
        dataSource={listData}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <AntdSkeleton
              className="my-dao-item-skeleton"
              loading
              active
              avatar={{
                shape: 'circle',
                size: 'small',
              }}
              paragraph={false}
            ></AntdSkeleton>
          </List.Item>
        )}
      />
    </>
  );
};
interface SkeletonLineProps {
  lines?: number;
}
const SkeletonLine: React.FC = (props: SkeletonLineProps) => {
  const { lines } = props;
  const dataSource = [...listData, ...listData];
  const renderList = dataSource.slice(0, lines);
  return (
    <>
      <List
        itemLayout="vertical"
        size="large"
        dataSource={renderList}
        renderItem={(item) => (
          <List.Item key={item.id} className="skeleton-line">
            <AntdSkeleton loading active avatar={false} paragraph={false}></AntdSkeleton>
          </List.Item>
        )}
      />
    </>
  );
};
const Skeleton: React.FC = () => {
  return <AntdSkeleton paragraph={{ rows: 4 }} className="skeleton-wrap" active />;
};
const SkeletonTab: React.FC = () => {
  return (
    <>
      <Space>
        <AntdSkeleton.Button active size={'default'} shape={'default'} />
        <AntdSkeleton.Button active size={'default'} shape={'default'} />
        <AntdSkeleton.Button active size={'default'} shape={'default'} />
      </Space>
      <br />
      <AntdSkeleton.Input active size={'default'} block={true} className="mt-[10px]" />
      <AntdSkeleton.Input active size={'default'} block={true} className="mt-[10px]" />
      <AntdSkeleton.Input active size={'default'} block={true} className="my-[10px]" />
    </>
  );
};
const SkeletonForm: React.FC = () => {
  return (
    <>
      <div className="mt-[20px]">
        <AntdSkeleton.Input active={true} size="small" />
        <AntdSkeleton.Input active size="small" block={true} className="mt-[5px]" />
      </div>

      <div className="mt-[20px]">
        <AntdSkeleton.Input active={true} size="small" />
        <AntdSkeleton.Input active size="small" block={true} className="mt-[5px]" />
      </div>

      <div className="mt-[20px]">
        <AntdSkeleton.Input active={true} size="small" />
        <AntdSkeleton.Input active size="small" block={true} className="mt-[5px]" />
      </div>

      <div className="mt-[20px]">
        <AntdSkeleton.Input active={true} size="small" />
        <AntdSkeleton.Input active size="small" block={true} className="mt-[5px]" />
      </div>
    </>
  );
};
export { SkeletonList, Skeleton, SkeletonDaoItemList, SkeletonLine, SkeletonTab, SkeletonForm };
