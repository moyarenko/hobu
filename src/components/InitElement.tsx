import { Outlet } from 'react-router-dom';

import { useInit } from '@/hooks';

export const InitElement = () => {
  const isInit = useInit();

  if (!isInit) return null;

  return <Outlet />;
};
