import { createBrowserRouter, RouteObject } from 'react-router-dom';

import { CategoryForm, ErrorElement, InitElement, OrderForm } from '@/components';
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
        children: [
          {
            path: '',
            element: <OrderForm />,
          },
          {
            path: Routes.REPORT_CREATE_CATEGORY,
            element: <CategoryForm />,
          },
        ],
      },

      {
        path: '*',
        element: <Page404 />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
