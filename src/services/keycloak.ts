import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  url: import.meta.env.VITE_BASE_URL_KEYCLOAK,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
});
