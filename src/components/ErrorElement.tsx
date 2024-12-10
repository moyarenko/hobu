import { Flex, Result } from 'antd';

export const ErrorElement = () => (
  <Flex justify="center" align="center" style={{ height: '100dvh' }}>
    <Result
      status="error"
      title="Some Failed"
      subTitle="Please check and modify the following information before resubmitting."
    />
  </Flex>
);
