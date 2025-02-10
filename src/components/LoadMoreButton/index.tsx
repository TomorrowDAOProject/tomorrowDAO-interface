import LoadingComponent from 'components/LoadingComponent';

import './index.css';

interface ILoadMoreButtonProps {
  onClick: () => void;
  loadingMore?: boolean;
}
export default function LoadMoreButton(props: ILoadMoreButtonProps) {
  const { loadingMore } = props;
  return (
    <div>
      {loadingMore ? (
        <LoadingComponent
          className="-my-3 md:my-0 scale-[0.7] md:scale-[1.0]"
          size={18}
          strokeWidth={2}
        />
      ) : (
        <div className="more-button font-Montserrat !border-white" onClick={props.onClick}>
          <span className="more-text text-white text-[12px]">Load More</span>
        </div>
      )}
    </div>
  );
}
