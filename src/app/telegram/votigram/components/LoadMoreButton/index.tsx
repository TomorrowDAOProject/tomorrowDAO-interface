import Refresh from '../Refresh';
import './index.css';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
}
export default function LoadMoreButton(props: LoadMoreButtonProps) {
  const { onClick, loading } = props;
  return (
    <div className="show-more-button-wrap">
      <div className="show-more-button-wrap-button" onClick={onClick}>
        <Refresh isLoading={loading} />
        <span className="font-17-22 font-[590]">Show more</span>
      </div>
    </div>
  );
}
