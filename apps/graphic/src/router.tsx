/**
 * React Router Configuration
 * File-based routing system (Next.js style)
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './routes/layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/graphic" replace />,
      },
      {
        path: 'graphic',
        lazy: async () => {
          const { default: Component } = await import('./routes/graphic/page');
          return { Component };
        },
      },
      {
        path: 'concept',
        lazy: async () => {
          const { default: Component } = await import('./routes/concept/page');
          return { Component };
        },
      },
      {
        path: 'floor',
        lazy: async () => {
          const { default: Component } = await import('./routes/floor/page');
          return { Component };
        },
      },
    ],
  },
]);
