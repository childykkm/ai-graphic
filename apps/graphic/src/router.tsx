/**
 * React Router Configuration
 * File-based routing system (Next.js style)
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './routes/layout';
import { AuthGuard } from './components/AuthGuard';

export const router = createBrowserRouter([
  {
    path: '/login',
    lazy: async () => {
      const { default: Component } = await import('./routes/login/page');
      return { Component };
    },
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
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
        path: 'multi',
        lazy: async () => {
          const { default: Component } = await import('./routes/multi/page');
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
      {
        path: 'model',
        lazy: async () => {
          const { default: Component } = await import('./routes/model/page');
          return { Component };
        },
      },
      {
        path: 'variation',
        lazy: async () => {
          const { default: Component } = await import('./routes/variation/page');
          return { Component };
        },
      },
      {
        path: 'history',
        lazy: async () => {
          const { default: Component } = await import('./routes/history/page');
          return { Component };
        },
      },
    ],
  },
]);
