import { useCallback, useMemo, useState } from 'react';
import useResponsive from 'hooks/useResponsive';
import { Dropdown } from 'aelf-design';
import { List, type MenuProps } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import ProposalDetailFile from 'assets/imgs/proposal-detail-file.svg';
import CommonDrawer from 'components/CommonDrawer';

type TPropsType = {
  list: IFileInfo[];
};
export default function PreviewFile(props: TPropsType) {
  const { list = [] } = props;
  const { isSM } = useResponsive();

  const [showDrawerModal, setShowDrawerModal] = useState(false);

  const fileItems: MenuProps['items'] = list.map((item, index) => {
    return {
      ...item,
      key: `${index}`,
      label: (
        <div className="min-w-36">
          <Link href={item.file.url} target="_blank">
            {item.file.name}
          </Link>
        </div>
      ),
    };
  });

  const handleClick = useCallback(() => {
    if (isSM) {
      setShowDrawerModal(true);
    }
  }, [isSM]);

  const btnCom = useMemo(() => {
    return (
      <div className="flex items-center justify-center h-8 bg-Neutral-Default-BG px-2 leading-8 rounded-md cursor-pointer">
        <Image width={14} height={14} src={ProposalDetailFile} alt="" onClick={handleClick}></Image>
        {!isSM && <span className="ml-1">Documentation</span>}
      </div>
    );
  }, [handleClick, isSM]);

  const handleClose = () => {
    setShowDrawerModal(false);
  };

  return (
    <div>
      {isSM ? (
        btnCom
      ) : (
        <Dropdown menu={{ items: fileItems }} placement="bottomRight">
          {btnCom}
        </Dropdown>
      )}
      <CommonDrawer title="Documentation" open={showDrawerModal} onClose={handleClose}>
        <List
          size="small"
          dataSource={list}
          renderItem={(item) => (
            <List.Item>
              <Link href={item.file.url} target="_blank">
                {item.file.name}
              </Link>
            </List.Item>
          )}
        />
      </CommonDrawer>
    </div>
  );
}
