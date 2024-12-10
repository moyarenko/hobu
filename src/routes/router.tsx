import { createBrowserRouter, RouteObject } from 'react-router-dom';

import { ErrorElement, InitElement } from '@/components';
import { ReportCreate, ReportView, Page404 } from '@/pages';

import { Routes } from './types';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <InitElement />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: Routes.REPORT,
        element: <ReportView />,
      },
      {
        path: Routes.REPORT_CREATE,
        element: <ReportCreate />,
      },

      {
        path: '*',
        element: <Page404 />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
