import { useLayoutEffect, useState } from 'react';

import { IndexedDBService } from '@/api/db';

const DB_DATABASE = process.env.REACT_APP_DATABASE;
let db: IndexedDBService | null = null;

export const useInit = () => {
  const [isInit, setInit] = useState(false);

  useLayoutEffect(() => {
    if (!db) {
      const init = async function () {
        const dbService = new IndexedDBService(DB_DATABASE);
        await dbService.init();
        setInit(true);
        db = dbService;
      };
      init();
    }
  }, []);

  return isInit;
};

export const useDB = () => {
  return db as IndexedDBService;
};
