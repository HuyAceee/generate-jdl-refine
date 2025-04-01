import { ErrorComponent, ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/antd';
import { Authenticated } from '@refinedev/core';
import { CatchAllNavigate, NavigateToResource } from '@refinedev/react-router';
import { lazy, Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router';

import { Header } from '~/components/header/Header';
import Title from '~/components/header/Title';

// Lazy import các trang
const Login = lazy(() => import('~/pages/login'));
const SampleList = lazy(() => import('~/pages/sample/list'));
const SampleCreate = lazy(() => import('~/pages/sample/create'));
const SampleEdit = lazy(() => import('~/pages/sample/edit'));
const SampleShow = lazy(() => import('~/pages/sample/show'));

export const AppRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route
        element={
          <Authenticated key="authenticated-inner" fallback={<CatchAllNavigate to="/login" />}>
            <ThemedLayoutV2
              Header={Header}
              Title={({ collapsed }) => <Title collapsed={collapsed} />}
              Sider={props => <ThemedSiderV2 {...props} Title={Title} />}
            >
              <Outlet />
            </ThemedLayoutV2>
          </Authenticated>
        }
      >
        <Route index element={<NavigateToResource resource="sample" />} />
        <Route path="/sample">
          <Route index element={<SampleList />} />
          <Route path="create" element={<SampleCreate />} />
          <Route path="edit/:id" element={<SampleEdit />} />
          <Route path="show/:id" element={<SampleShow />} />
        </Route>
        <Route path="*" element={<ErrorComponent />} />
      </Route>

      <Route
        element={
          <Authenticated key="authenticated-outer" fallback={<Outlet />}>
            <NavigateToResource />
          </Authenticated>
        }
      >
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  </Suspense>
);
