import { Radio } from 'antd';
import type { RadioChangeEvent, InputNumberProps } from 'antd';
import { DatePicker as AntdMobileDatePicker } from 'antd-mobile';
import { useState } from 'react';
import dayjs, { ManipulateType } from 'dayjs';
import './index.css';
import { ActiveEndTimeEnum } from 'pageComponents/proposal-create/type';
import { TimeSelectIcon } from 'components/Icons';

export interface IActiveEndTimeDuration {
  unit: ManipulateType;
  value: number;
}
interface IActiveEndTimeProps {
  value?: IActiveEndTimeDuration | number;
  onChange?: (value: IActiveEndTimeDuration | number) => void;
}
interface IDurationItem extends IActiveEndTimeDuration {
  label: string;
}

const DurationList: IDurationItem[] = [
  {
    label: '1 Hour',
    value: 1,
    unit: 'hour',
  },
  {
    label: '1 Day',
    value: 1,
    unit: 'day',
  },
  {
    label: '3 Days',
    value: 3,
    unit: 'day',
  },
  {
    label: '5 Days',
    value: 5,
    unit: 'day',
  },
  {
    label: '1 Week',
    value: 7,
    unit: 'day',
  },
  {
    label: '2 Weeks',
    value: 14,
    unit: 'day',
  },
];

export default function ActiveEndTime(props: IActiveEndTimeProps) {
  const { value: propsValue, onChange } = props;
  const [value, setValue] = useState<ActiveEndTimeEnum>(ActiveEndTimeEnum.duration);
  const [visible, setVisible] = useState(false);
  const handleChange = (e: RadioChangeEvent) => {
    const { onChange } = props;
    const { value } = e.target;
    if (value === ActiveEndTimeEnum.duration) {
      onChange?.({
        unit: 'hour',
        value: 1,
      });
    }
    if (value === ActiveEndTimeEnum.custom) {
      onChange?.(dayjs().add(1, 'day').valueOf());
    }
    setValue(value);
  };
  return (
    <div className="votigram-active-time-end-wrap">
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
                onChange?.(value?.valueOf());
                setVisible(false);
              }}
              onCancel={() => {
                setVisible(false);
              }}
            />
          </div>
        )}
        {value === ActiveEndTimeEnum.duration &&
          typeof propsValue !== 'number' &&
          typeof propsValue !== 'undefined' && (
            <div className="active-time-end-input-duration">
              {DurationList.map((item, i) => {
                return (
                  <div
                    key={i}
                    className={`active-time-end-input-duration-item ${
                      propsValue.unit === item.unit && propsValue.value === item.value
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => {
                      onChange?.(item);
                    }}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
