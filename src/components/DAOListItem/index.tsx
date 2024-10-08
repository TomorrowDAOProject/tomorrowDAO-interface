import { Typography } from 'antd';
import './index.css';
const { Paragraph } = Typography;
import { Typography as DesignTypography } from 'aelf-design';
import useResponsive from 'hooks/useResponsive';
import ImageWithPlaceHolder from 'components/ImageWithPlaceHolder';
import VerifiedIcon from './VerifiedIcon';
interface IDAOListItemProps {
  item: IDaoItem;
}
export default function DAOListItem(props: IDAOListItemProps) {
  const { item } = props;
  const { isSM } = useResponsive();
  return (
    <div className="dao-list-item">
      <div className="dao-list-item-title">
        <div className="dao-logo">
          <ImageWithPlaceHolder
            src={item.logo}
            text={item.name}
            alias={item.alias}
            imageProps={{
              width: 40,
              height: 40,
            }}
          />
        </div>
        <div className="dao-title">
          <DesignTypography.Title level={isSM ? 6 : 5}>{item.name}</DesignTypography.Title>
        </div>
        {item.verifiedType && (
          <div className="verified-icon-wrap">
            <VerifiedIcon verifiedType={item.verifiedType} />
          </div>
        )}
      </div>
      <div className="dao-list-item-content">
        <Paragraph
          ellipsis={{
            rows: 2,
          }}
          className="content-text"
        >
          {item.description}
        </Paragraph>
      </div>
      <div className="dao-list-item-count">
        <div className="count-item">
          <div className="count-title">Proposals</div>
          <div className="count-amount">{item.proposalsNum}</div>
        </div>
        <div className="count-item">
          <div className="count-title">Holders</div>
          <div className="count-amount">{item.symbolHoldersNum}</div>
        </div>
        {item.isNetworkDAO ? (
          <div className="count-item">
            <div className="count-title">BP</div>
            <div className="count-amount">{item.highCouncilMemberCount}</div>
          </div>
        ) : (
          <div className="count-item">
            <div className="count-title">Voters</div>
            <div className="count-amount">{item.votersNum}</div>
          </div>
        )}
      </div>
    </div>
  );
}
