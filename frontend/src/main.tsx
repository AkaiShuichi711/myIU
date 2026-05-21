import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import AuthProvider from "./context/AuthContext";
import { msalConfig } from "./lib/msal/config";
// import "./i18n";

const msalInstance = new PublicClientApplication(msalConfig);
console.log("Booting myIU app — main.tsx");

import "./i18n";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MsalProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
