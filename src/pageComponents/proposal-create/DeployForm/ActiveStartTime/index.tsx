import { Radio, DatePicker } from 'antd';
import { DatePicker as AntdMobileDatePicker } from 'antd-mobile';
import type { RadioChangeEvent } from 'antd';
import { useState } from 'react';
import { ActiveStartTimeEnum } from '../../type';
import dayjs from 'dayjs';
import './index.css';
import { TimeSelectIcon } from 'components/Icons';

interface IActiveStartTimeProps {
  value?: string | number;
  onChange?: (value: string | number | undefined) => void;
  mobile?: boolean;
}

export default function ActiveStartTime(props: IActiveStartTimeProps) {
  const { value: propsValue, mobile } = props;
  const [value, setValue] = useState<ActiveStartTimeEnum>(ActiveStartTimeEnum.now);
  const [visible, setVisible] = useState(false);
  const handleChange = (e: RadioChangeEvent) => {
    const { onChange } = props;
    const { value } = e.target;
    if (value === ActiveStartTimeEnum.now) {
      onChange?.(value);
    }
    if (value === ActiveStartTimeEnum.custom) {
      onChange?.(dayjs().valueOf());
    }
    setValue(value);
  };
  return (
    <div>
      <div className="active-time-item-radio">
        <Radio.Group onChange={handleChange} value={value}>
          <Radio value={ActiveStartTimeEnum.now}>Now</Radio>
          <Radio value={ActiveStartTimeEnum.custom}>Specific date & time</Radio>
        </Radio.Group>
      </div>
      <div className="active-start-time-date-picker">
        {value === ActiveStartTimeEnum.custom && !mobile && (
          <DatePicker
            defaultValue={dayjs()}
            showTime
            value={propsValue ? dayjs(propsValue) : undefined}
            onChange={(value) => {
              const { onChange } = props;
              onChange?.(value?.valueOf());
            }}
          />
        )}
        {value === ActiveStartTimeEnum.custom && mobile && (
          <div>
            <div
              className="fake-input-start-time-select flex items-center justify-between"
              onClick={() => {
                setVisible(true);
              }}
            >
              <span>
                {propsValue ? dayjs(propsValue).format('YYYY-MM-DD HH:mm:ss') : dayjs().format()}
              </span>
              <TimeSelectIcon />
            </div>
            <AntdMobileDatePicker
              style={{
                '--header-button-font-size': '16px',
                '--item-font-size': '14px',
                '--item-height': '48px',
              }}
              className="antd-mobile-date-picker"
              visible={visible}
              defaultValue={dayjs().toDate()}
              value={propsValue ? dayjs(propsValue).toDate() : undefined}
              precision="second"
              onConfirm={(value: Date) => {
                const { onChange } = props;
                onChange?.(value?.valueOf());
                setVisible(false);
              }}
              onCancel={() => {
                setVisible(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
