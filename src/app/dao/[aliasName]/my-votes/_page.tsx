'use client';

import { useRouter, useParams } from 'next/navigation';
// import Filter from './components/Filter';
import RecordTable from './components/Table';
import './page.css';

interface IProps {
  ssrData: {
    daoInfo: IDaoInfoRes;
    ProposalListResData: IProposalListResData;
  };
  daoId?: string;
  aliasName?: string;
  isNetworkDAO?: boolean;
}

export default function MyRecord() {
  // const [form] = Form.useForm();

  // const handleSearch = () => {
  //   console.log(form.getFieldsValue());
  // };
  const router = useRouter();
  const { aliasName } = useParams();
  console.log('aliasName', aliasName);
  return (
    <div className="min-h-[calc(100%-300px)] mx-[20px] my-[39px] md:w-[840px] lg:w-[1056px] xl:w-[1120px] md:m-auto lg:m-auto xl:m-auto xl:my-[51px] lg:my-[51px] md:my-[51px] w-full">
      <div className="text-white font-Montserrat flex items-center gap-2 pb-[25px]">
        <span
          className="text-lightGrey text-[15px] cursor-pointer"
          onClick={() => router.push('/')}
        >
          Home
        </span>
        <i className="tmrwdao-icon-arrow text-[16px] text-lightGrey" />
        <span
          className="text-lightGrey text-[15px] cursor-pointer"
          onClick={() => router.push('/explore')}
        >
          Explore
        </span>
        <i className="tmrwdao-icon-arrow text-[16px] text-lightGrey" />
        <span
          className="text-lightGrey text-[15px] cursor-pointer"
          onClick={() => router.push(`/dao/${aliasName}`)}
        >
          {aliasName
            .toString()
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </span>
        <i className="tmrwdao-icon-arrow text-[16px] text-lightGrey" />
        <span className="text-[14px]">{'My Votes'}</span>
      </div>
      <div className="border border-fillBg8 border-solid rounded-lg bg-darkBg">
        <div className="font-Unbounded text-[15px] font-[300] text-white py-[17px] px-[30px] border-0 border-b border-solid border-fillBg8">
          My Votes
        </div>

        <div className="xl:px-[38px] xl:py-[24px] lg:px-[38px] lg:py-[24px] md:px-[38px] md:py-[24px] p-[22px]">
          <RecordTable />
        </div>
      </div>
    </div>
  );
}
