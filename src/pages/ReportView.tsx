import { Flex, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { useCategories, useTitle } from '@/hooks';

export const ReportView = () => {
  useTitle('Report view');
  const { data, isPending, isError, error } = useCategories();

  console.log('dataL ', data, isPending, isError, error);

  if (isPending)
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
  return null;
};
