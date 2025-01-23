import ImageWithPlaceHolder from 'components/ImageWithPlaceHolder';
import VerifiedIcon from './VerifiedIcon';
interface IDAOListItemProps {
  item: IDaoItem;
}
export default function DAOListItem(props: IDAOListItemProps) {
  const { item } = props;
  return (
    <div className="p-[26px] flex flex-col bg-darkBg border border-solid border-fillBg8 rounded-[8px]">
      <div className="flex flex-row items-center gap-[14px]">
        <div className="w-10 h-10">
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
        <div className="max-w-[70%] whitespace-nowrap overflow-hidden text-ellipsis text-white">
          <span className="text-h5 font-Unbounded font-light">{item.name}</span>
        </div>
        {item.verifiedType && <VerifiedIcon verifiedType={item.verifiedType} />}
      </div>
      <div className="h-[44px] mt-4 mb-[18px]">
        <span className="text-white line-clamp-2 text-desc14 md:text-desc12 lg:text-desc14 font-Montserrat">
          {item.description}
        </span>
      </div>
      <div className="flex flex-row item-center flex-wrap gap-y-2">
        <div className="flex items-center gap-2 w-1/2 lg:w-1/3">
          <span className="text-desc14 text-lightGrey font-Montserrat">Proposals</span>
          <span className="text-descM14 text-white font-Montserrat">{item.proposalsNum}</span>
        </div>
        <div className="flex items-center gap-2 w-1/2 lg:w-1/3">
          <span className="text-desc14 text-lightGrey font-Montserrat">Holders</span>
          <span className="text-descM14 text-white font-Montserrat">{item.symbolHoldersNum}</span>
        </div>
        {item.isNetworkDAO ? (
          <div className="flex items-center gap-2 w-1/2 lg:w-1/3">
            <span className="text-desc14 text-lightGrey font-Montserrat">BP</span>
            <span className="text-descM14 text-white font-Montserrat">
              {item.highCouncilMemberCount}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-1/2 lg:w-1/3">
            <span className="text-desc14 text-lightGrey font-Montserrat">Voters</span>
            <span className="text-descM14 text-white font-Montserrat">{item.votersNum}</span>
          </div>
        )}
      </div>
    </div>
  );
}
