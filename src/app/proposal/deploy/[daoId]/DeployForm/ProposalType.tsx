'use client';

import { Button, Form } from 'antd';
import { memo } from 'react';
import { ResponsiveSelect } from 'components/ResponsiveSelect';
import { proposalTypeList } from 'types';

const defaultType = proposalTypeList[0].value;
console.log('defaultType', defaultType, proposalTypeList);

interface ProposalTypeProps {
  next?: () => void;
  className?: string;
}
const ProposalType = (props: ProposalTypeProps) => {
  const { next, className } = props;
  return (
    <div className={className}>
      <h2 className="title-primary">Choose Proposal Type</h2>
      <p className=" text-[16px] leading-[24px] text-Neutral-Secondary-Text font-normal mt-[8px] mb-[64px]">
        When creating a proposal, please choose the appropriate type based on its purpose and
        impact.
      </p>
      <Form.Item
        name={'proposalType'}
        label={null}
        rules={[{ required: true, message: 'Please select proposal type' }]}
        initialValue={proposalTypeList[0].value}
      >
        <ResponsiveSelect
          popupClassName="proposal-type-select"
          drawerProps={{
            title: 'Proposal Type',
            className: 'proposal-type-draw',
          }}
          options={proposalTypeList}
          optionLabelProp="label"
          optionRender={(option, info) => (
            <ProposalTypeItem label={option.data.label} desc={option.data.desc} key={info.index} />
          )}
        ></ResponsiveSelect>
      </Form.Item>
      <div className="flex justify-end mt-[494px]">
        <Button type="primary" className="w-[156px]" onClick={next}>
          Continue
        </Button>
      </div>
    </div>
  );
};
function ProposalTypeItem(props: { label: string; desc: string }) {
  const { label, desc } = props;
  return (
    <div>
      <h2 className="text-[16px] leading-[24px] font-normal label-text">{label}</h2>
      <p className="text-[14px] mt-[4px] leading-[22px] font-normal text-Neutral-Disable-Text text-wrap">
        {desc}
      </p>
    </div>
  );
}
export default memo(ProposalType);
