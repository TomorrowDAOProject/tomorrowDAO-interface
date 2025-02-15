import { useEffect, useState } from 'react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { DayPicker, DateBefore, WeekdayProps } from 'react-day-picker';

import Drawer from '../Drawer';

import 'react-day-picker/style.css';

import './index.css';
import Button from 'components/Button';

interface ISimpleDatePickerProps {
  disabled?: DateBefore;
  value?: string;
  defaultValue?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const SimpleDatePicker = (props: ISimpleDatePickerProps) => {
  const { value, defaultValue, className, disabled, onChange, ...dayPickerProps } = props;
  const baseValue =
    value && dayjs(value || '').isValid()
      ? value
      : defaultValue && dayjs(defaultValue || '').isValid()
      ? defaultValue
      : dayjs().format();
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState<string>(baseValue);

  const formatDate = (dateInput: string) => {
    const date = dayjs(dateInput);
    const currentYear = dayjs().year();

    if (date.year() === currentYear) {
      return date.format('DD MMM');
    } else {
      return date.format('DD MMM YYYY');
    }
  };

  const handleConfirm = () => {
    const selectedDate = selected ? dayjs(selected).format('YYYY-MM-DD') : '';
    onChange?.(selectedDate);
    setIsVisible(false);
  };

  useEffect(() => {
    if (value && dayjs(value).isValid()) {
      setSelected(value);
    }
  }, [value]);

  return (
    <>
      <div
        className={clsx(
          'relative py-[13px] px-4 pr-[40px] border border-solid border-fillBg8 rounded-[8px] cursor-pointer',
          className,
        )}
        onClick={() => setIsVisible(true)}
        role="button"
        aria-label="select date"
      >
        <span className="block min-w-[50px] h-[20px] font-normal text-desc14 text-lightGrey leading-[20px] font-Montserrat">
          {selected && formatDate(selected)}
        </span>

        <i className="absolute top-1/2 right-[14px] -translate-y-1/2 tmrwdao-icon-calendar text-lightGrey text-[18px]" />
      </div>
      <Drawer
        isVisible={isVisible}
        direction="bottom"
        onClose={setIsVisible}
        rootClassName="px-[17.5px] pt-5 pb-7 bg-tertiary md:border md:border-solid md:border-borderColor"
        role="dialog"
        canClose
      >
        <DayPicker
          mode="single"
          selected={new Date(selected)}
          onSelect={(date) => date && setSelected(dayjs(date).format('YYYY-MM-DD'))}
          disabled={
            disabled || {
              before: new Date(),
            }
          }
          weekStartsOn={1}
          components={{
            Weekday: (props: WeekdayProps) => {
              return <th>{props['aria-label']?.slice(0, 3)}</th>;
            },
          }}
          className="simple-date-picker"
          {...dayPickerProps}
        />
        <Button type="primary" className="!w-full" disabled={!selected} onClick={handleConfirm}>
          Confirm
        </Button>
      </Drawer>
    </>
  );
};

export default SimpleDatePicker;
