import React from 'react';
import { Form } from 'antd';
import { Search } from 'aelf-design';
type TPropsType = {
  form: any;
  onSearch: any;
  query?: Object;
};

export default function Filter(props: TPropsType) {
  const { form, onSearch } = props;

  return (
    <Form layout="inline" form={form} name="control-hooks">
      <Form.Item name="content">
        <Search inputSize="small" placeholder="Proposals Name / ID" onChange={onSearch} />
      </Form.Item>
    </Form>
  );
}
