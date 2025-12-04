'use client';
import { useEffect } from 'react';
import DAOList from './components/DAOList';
import breadCrumb from 'utils/breadCrumb';
import './index.css';

interface IProps {
  ssrData: {
    daoList: IDaoItem[];
    verifiedDaoList: IDaoItem[];
    daoHasData: boolean;
  };
}
export default function Home(props: IProps) {
  const { ssrData } = props;
  useEffect(() => {
    breadCrumb.clearBreadCrumb();
  }, []);
  return (
    <div className="tmrwdao-grid !gap-[20px]">
      {/* <DAOHeader /> */}
      <DAOList ssrData={ssrData} />
    </div>
  );
}
