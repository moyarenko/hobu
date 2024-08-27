import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function useLocalStorage<T = unknown>(key: string, initValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(
    localStorage.getItem(key) ? (JSON.parse(localStorage.getItem(key) as string) as T) : initValue
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
