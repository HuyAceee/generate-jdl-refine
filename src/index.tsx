import { ReactKeycloakProvider } from '@react-keycloak/web';
import { createRoot } from 'react-dom/client';

import App from './App';
import { keycloak } from './services/keycloak';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <ReactKeycloakProvider authClient={keycloak}>
    <App />
  </ReactKeycloakProvider>,
);
