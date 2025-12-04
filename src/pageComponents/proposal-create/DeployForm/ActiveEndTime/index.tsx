import { Radio, DatePicker, InputNumber } from 'antd';
import type { RadioChangeEvent, InputNumberProps } from 'antd';
import { useState } from 'react';
import { ActiveEndTimeEnum } from '../../type';
import dayjs from 'dayjs';
import './index.css';
import { DownOutlined, UpOutlined } from '@aelf-design/icons';

interface IActiveEndTimeProps {
  value?: number[] | number;
  onChange?: (value: number[] | number) => void;
}
export const defaultActiveEndTimeDuration = [0, 0, 1];

interface IInputNumberWithIncreaseProps extends InputNumberProps {
  onAdd?: () => void;
  onMinus?: () => void;
}
const InputNumberWithIncrease = (props: IInputNumberWithIncreaseProps) => {
  return (
    <InputNumber
      className="input-number-with-up-down-wrap"
      controls={{
        upIcon: <UpOutlined />,
        downIcon: <DownOutlined />,
      }}
      {...props}
      precision={0}
    />
  );
};
export default function ActiveEndTime(props: IActiveEndTimeProps) {
  const { value: propsValue, onChange } = props;
  const [value, setValue] = useState<ActiveEndTimeEnum>(ActiveEndTimeEnum.duration);
  const handleChange = (e: RadioChangeEvent) => {
    const { onChange } = props;
    const { value } = e.target;
    if (value === ActiveEndTimeEnum.duration) {
      onChange?.(defaultActiveEndTimeDuration);
    }
    if (value === ActiveEndTimeEnum.custom) {
      onChange?.(dayjs().add(1, 'day').valueOf());
    }
    setValue(value);
  };

  const updateDuration = (index: number, value: number | string | null) => {
    if (typeof value === 'string') {
      value = Number(value);
    }
    value = value ?? 0;
    if (!Array.isArray(propsValue)) {
      return;
    }
    const newDuration = [...propsValue];
    newDuration[index] = value;
    onChange?.(newDuration);
  };
  const addDuration = (index: number) => {
    if (!Array.isArray(propsValue)) {
      return;
    }
    const newDuration = [...propsValue];
    newDuration[index] = newDuration[index] + 1;
    onChange?.(newDuration);
  };
  const minusDuration = (index: number) => {
    if (!Array.isArray(propsValue)) {
      return;
    }
    const newDuration = [...propsValue];
    newDuration[index] = Math.max(0, newDuration[index] - 1);
    onChange?.(newDuration);
  };
  return (
    <div className="active-time-end-wrap">
      <div className="active-time-item-radio">
        <Radio.Group onChange={handleChange} value={value}>
          <Radio value={ActiveEndTimeEnum.duration}>
            <span>Duration</span>
          </Radio>
          <Radio value={ActiveEndTimeEnum.custom}>
            <span>Specific date & time</span>
          </Radio>
        </Radio.Group>
      </div>
      <div className="active-end-time-fill">
        {value === ActiveEndTimeEnum.custom && typeof propsValue === 'number' && (
          <DatePicker
            showTime
            defaultValue={dayjs().add(1, 'day')}
            onChange={(value) => {
              const { onChange } = props;
              onChange?.(value?.valueOf());
            }}
          />
        )}
        {value === ActiveEndTimeEnum.duration && Array.isArray(propsValue) && (
          <div className="active-time-end-input">
            <div className="active-time-end-input-item">
              <p className="active-time-end-input-duration">Minutes</p>
              <InputNumberWithIncrease
                min={0}
                defaultValue={defaultActiveEndTimeDuration[0]}
                onChange={(value: number | string | null) => {
                  updateDuration(0, value);
                }}
                value={propsValue[0]}
                onAdd={() => {
                  addDuration(0);
                }}
                onMinus={() => {
                  minusDuration(0);
                }}
              />
            </div>
            <div className="active-time-end-input-item">
              <p className="active-time-end-input-duration">Hours</p>
              <InputNumberWithIncrease
                min={0}
                defaultValue={defaultActiveEndTimeDuration[1]}
                onChange={(value: number | string | null) => {
                  updateDuration(1, value);
                }}
                value={propsValue[1]}
                onAdd={() => {
                  addDuration(1);
                }}
                onMinus={() => {
                  minusDuration(1);
                }}
              />
            </div>
            <div className="active-time-end-input-item">
              <p className="active-time-end-input-duration">Days</p>
              <InputNumberWithIncrease
                min={0}
                defaultValue={defaultActiveEndTimeDuration[2]}
                onChange={(value: number | string | null) => {
                  updateDuration(2, value);
                }}
                value={propsValue[2]}
                onAdd={() => {
                  addDuration(2);
                }}
                onMinus={() => {
                  minusDuration(2);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
