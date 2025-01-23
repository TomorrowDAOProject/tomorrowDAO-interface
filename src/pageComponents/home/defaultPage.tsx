'use client';
import { useEffect } from 'react';
import DAOHeader from './components/DAOHeader';
import DAOList from './components/DAOList';
import breadCrumb from 'utils/breadCrumb';
import './index.css';
import useResponsive from 'hooks/useResponsive';

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
  const { isLG } = useResponsive();
  return (
    <div className="tmrwdao-grid">
      <div className="col-12">
        {!isLG && <DAOHeader />}
        {/* <DAOHeader /> */}
        <DAOList ssrData={ssrData} />
      </div>
    </div>
  );
}
