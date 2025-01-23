import { useMemo } from 'react';
import { proposalTypeList, TMRWCreateProposal } from '../../constants';
import DetailTag from 'components/DetailTag';

export interface IProposalTagProps {
  proposalSource?: number;
  governanceMechanism: string;
  proposalType: string;
}
export default function ProposalTag(props: IProposalTagProps) {
  const { proposalSource, governanceMechanism, proposalType } = props;
  const tagList = useMemo(() => {
    const proposalLabelValue = proposalTypeList.find((item) => item.value === proposalType);
    if (proposalSource === TMRWCreateProposal) {
      return [governanceMechanism, proposalLabelValue?.label];
    }
    return [proposalLabelValue?.label];
  }, [governanceMechanism, proposalSource, proposalType]);
  return (
    <>
      {tagList.map((item: any) => (
        <DetailTag
          className="proposal-tag rounded-lg border border-solid !border-fillBg8 !px-2 !h-auto !py-1 !text-[10px]"
          key={item}
          customStyle={{
            text: item,
            height: 20,
            color: '#989DA0',
            bgColor: 'rgba(255,255,255,0.08)',
          }}
        />
      ))}
    </>
  );
}
