import { useQuery } from '@tanstack/react-query';

import { useDB } from './useDB';

export const useOrders = (filter?: Order.Filter) => {
  const db = useDB();
  return useQuery({
    queryKey: ['orders', filter],
    queryFn: () => db.getOrders(filter),
    initialData: [],
  });
};
