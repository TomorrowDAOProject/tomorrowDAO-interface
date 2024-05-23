import { Button, Result, Typography } from 'antd';
import { CloseCircleOutlined } from '@aelf-design/icons';
const { Paragraph, Text } = Typography;
// export interface IErrorProps {}
export default function Error() {
  return (
    <Result
      status="error"
      title="something went wrong"
      subTitle="Please check your network connection, Try again later."
    ></Result>
  );
}
