'use client';

import { useState } from 'react';
import { Form, Card } from 'antd';
import Filter from './components/Filter';
import RecordTable from './components/Table';
import useResponsive from 'hooks/useResponsive';
import './page.css';

export default function MyRecord() {
  const [form] = Form.useForm();

  const handleSearch = () => {
    console.log(form.getFieldsValue());
  };
  return (
    <div className="myRecord w-full">
      <Card
        className="w-full m"
        title={
          <div className="py-6 block lg:flex justify-between items-center">
            <div className="mb-4 lg:m-0">My Votes</div>
            <Filter form={form} onSearch={handleSearch} />
          </div>
        }
        // extra={!isSM && <Filter form={form} onSearch={handleSearch} />}
        styles={{
          body: {
            padding: 0,
            marginTop: 1,
          },
        }}
      >
        <RecordTable />
      </Card>
    </div>
  );
}
