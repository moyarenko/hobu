import { useQuery } from '@tanstack/react-query';

import { useDB } from './useDB';

export const useCategories = () => {
  const db = useDB();
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => db.getCategories(),
  });
};
