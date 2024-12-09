import { Result } from 'antd';

export const ErrorElement = () => (
  <Result
    status="error"
    title="Some Failed"
    subTitle="Please check and modify the following information before resubmitting."
  />
);
