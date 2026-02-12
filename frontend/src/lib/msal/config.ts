import { Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AD_CLIENT_ID || "YOUR_CLIENT_ID",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AD_TENANT_ID || "YOUR_TENANT_ID"}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};

export const armConfig = {
  armEndpoint: "https://management.azure.com/tenants?api-version=2020-01-01",
  scopes: ["https://management.azure.com/user_impersonation"],
};