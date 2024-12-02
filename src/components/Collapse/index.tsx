import CollapseItem from './CollapseItem';

export interface ItemType {
  key: string;
  label: string;
  children: React.ReactNode;
}

interface IProps {
  items: ItemType[];
  defaultActiveKey?: string[];
}

const WebCollapse = ({ items, defaultActiveKey }: IProps) => {
  return (
    <div className="border-0 border-t-[1px] border-fillBg40 border-solid">
      {items.map((item, index) => (
        <CollapseItem key={index} item={item} isOpened={defaultActiveKey?.includes(item.key)} />
      ))}
    </div>
  );
};

export default WebCollapse;
