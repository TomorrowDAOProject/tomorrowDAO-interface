'use client';

import { Form, SelectProps } from 'antd';
import { memo } from 'react';
import { ResponsiveSelect } from 'components/ResponsiveSelect';
import { ButtonCheckLogin } from 'components/ButtonCheckLogin';

interface ProposalTypeProps {
  options: SelectProps['options'];
  next?: () => void;
  className?: string;
  titleNode?: React.ReactNode;
  descriptionNode?: React.ReactNode;
}
const ProposalType = (props: ProposalTypeProps) => {
  const { next, className, options } = props;
  return (
    <div className={className}>
      {props.titleNode}
      {props.descriptionNode}
      <Form.Item
        name={'proposalType'}
        label={null}
        rules={[{ required: true, message: 'Please select proposal type' }]}
        initialValue={options?.[0].value}
      >
        <ResponsiveSelect
          popupClassName="proposal-type-select"
          drawerProps={{
            title: 'Proposal Type',
            className: 'proposal-type-draw',
          }}
          options={options}
          optionLabelProp="label"
          optionRender={(option, info) => (
            <ProposalTypeItem label={option.data.label} desc={option.data.desc} key={info.index} />
          )}
        ></ResponsiveSelect>
      </Form.Item>
      <div className="flex justify-end mt-[50px]">
        <ButtonCheckLogin
          type="primary"
          className="w-[156px] text-[15px] bg-mainColor hover:!text-mainColor hover:!bg-transparent border border-solid border-mainColor font-Montserrat !rounded-[42px]"
          onClick={next}
        >
          Continue
        </ButtonCheckLogin>
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
