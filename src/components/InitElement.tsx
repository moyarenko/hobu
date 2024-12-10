import { Flex, Spin } from 'antd';
import { Outlet } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';

import { useInit } from '@/hooks';

export const InitElement = () => {
  const isInit = useInit();

  if (!isInit)
    return (
      <Flex
        align="center"
        justify="center"
        style={{
          height: '100dvh',
        }}
      >
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </Flex>
    );

  return <Outlet />;
};
