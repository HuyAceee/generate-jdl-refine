import { ErrorComponent, ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/antd';
import { Authenticated } from '@refinedev/core';
import { CatchAllNavigate, NavigateToResource } from '@refinedev/react-router';
import { Outlet, Route, Routes } from 'react-router';

import { Header } from '~/components/header/Header';
import Title from '~/components/header/Title';
import { Login } from '~/pages/login';
import { SampleCreate, SampleEdit, SampleList, SampleShow } from '~/pages/sample';

export const AppRoutes = () => (
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
);
