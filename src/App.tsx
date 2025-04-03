import { useKeycloak } from '@react-keycloak/web';
import { useNotificationProvider } from '@refinedev/antd';
import '@refinedev/antd/dist/reset.css';
import { Refine } from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from '@refinedev/devtools';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import routerBindings, { DocumentTitleHandler, UnsavedChangesNotifier } from '@refinedev/react-router';
import { App as AntdApp } from 'antd';
import { TOptionsBase } from 'i18next';
import { $Dictionary } from 'i18next/typescript/helpers';
import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';

import '~/assets/css/index.css';

import { ColorModeContextProvider } from './config/contexts/color-mode';
import { ModalProvider } from './context/ModalContext';
import i18n from './i18n';
import { AppRoutes } from './routes';
import { resources } from './routes/resources';
import { authProvider } from './services/authProvider';
import { dataProvider } from './services/dataProvider';
import { store } from './store';

function App() {
  const { initialized } = useKeycloak();
  const { t } = useTranslation();
  const i18nProvider = {
    translate: (key: string, options?: (TOptionsBase & $Dictionary) | undefined) => t(key, options),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  if (!initialized) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Provider store={store}>
        <ModalProvider>
          <RefineKbarProvider>
            <ColorModeContextProvider>
              <AntdApp>
                <DevtoolsProvider>
                  <Refine
                    dataProvider={dataProvider}
                    notificationProvider={useNotificationProvider}
                    routerProvider={routerBindings}
                    authProvider={authProvider}
                    resources={resources}
                    i18nProvider={i18nProvider}
                    options={{
                      syncWithLocation: true,
                      warnWhenUnsavedChanges: true,
                      useNewQueryKeys: true,
                      projectId: 'xiAile-rOluTO-RIMJ5f',
                    }}
                  >
                    <AppRoutes />

                    <RefineKbar />
                    <UnsavedChangesNotifier />
                    <DocumentTitleHandler />
                  </Refine>
                  <DevtoolsPanel />
                </DevtoolsProvider>
              </AntdApp>
            </ColorModeContextProvider>
          </RefineKbarProvider>
        </ModalProvider>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
