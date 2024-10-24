import { Form } from 'antd';
import { Tooltip } from 'aelf-design';
import { InfoCircleOutlined } from '@aelf-design/icons';
import ActiveStartTime from '../ActiveStartTime';
import ActiveEndTime, { defaultActiveEndTimeDuration } from '../ActiveEndTime';
import { ActiveStartTimeEnum } from '../../type';
import { activeEndTimeName, activeStartTimeName } from '../constant';
import './index.css';

interface ITimeRangeStartTimeProps {
  mobile?: boolean;
  ignoreToolTip?: boolean;
}
export const TimeRangeStartTime = (props: ITimeRangeStartTimeProps) => {
  const { ignoreToolTip } = props;
  return (
    <Form.Item
      className="voting-start-time-form-label"
      label={
        ignoreToolTip ? (
          <span className="form-item-label">Voting start time</span>
        ) : (
          <Tooltip title="Define when a proposal should be active to receive approvals. If now is selected, the proposal is immediately active after publishing.">
            <span className="form-item-label">
              Voting start time
              <InfoCircleOutlined className="cursor-pointer label-icon" />
            </span>
          </Tooltip>
        )
      }
      initialValue={ActiveStartTimeEnum.now}
      name={activeStartTimeName}
      rules={[
        {
          required: true,
          message: 'The voting start time is required',
        },
      ]}
    >
      <ActiveStartTime mobile={props.mobile} />
    </Form.Item>
  );
};
export default function TimeRange() {
  return (
    <>
      <TimeRangeStartTime />
      <Form.Item
        label={
          <Tooltip title="Define how long the voting should last in days, or add an exact date and time for it to conclude.">
            <span className="form-item-label">
              Voting end date
              <InfoCircleOutlined className="cursor-pointer label-icon" />
            </span>
          </Tooltip>
        }
        initialValue={defaultActiveEndTimeDuration}
        name={activeEndTimeName}
        rules={[
          {
            required: true,
            message: 'The voting end time is required',
          },
          {
            validator: (_, value) => {
              return new Promise<void>((resolve, reject) => {
                if (Array.isArray(value)) {
                  if (value.every((item) => item === 0)) {
                    reject('The voting end time is required');
                  }
                  const [minutes, hours, days] = value;
                  const totalDays = days + hours / 24 + minutes / 1440;
                  if (totalDays > 365) {
                    reject('The maximum duration is 365 days');
                  }
                }
                resolve();
              });
            },
          },
        ]}
      >
        <ActiveEndTime />
      </Form.Item>
    </>
  );
}
