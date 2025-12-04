interface IApproveThresholdTipProps {
  percent: number;
}
export function ApproveThresholdTip(props: IApproveThresholdTipProps) {
  const isLarge = props.percent >= 50;
  return (
    <p className={`card-xsm-text pt-[4px] ${isLarge ? 'text-[#05C4A2]' : 'text-Active-Text'}`}>
      {isLarge
        ? 'Proposal will be approved by majority.'
        : 'Proposals could be approved by a minority rather than a majority.'}
    </p>
  );
}
