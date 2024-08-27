import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useTitle = (title: string) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = `${t(title)} | ${process.env.REACT_APP_TITLE as string}`;
  }, [title, t]);

  return {
    t,
    i18n,
  };
};
