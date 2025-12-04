import DefaultPage from './defaultPage';
interface IProps {
  ssrData: {
    daoList: IDaoItem[];
    verifiedDaoList: IDaoItem[];
    daoHasData: boolean;
  };
}
export default function Home(props: IProps) {
  const { ssrData } = props;
  return <DefaultPage ssrData={ssrData} />;
}
