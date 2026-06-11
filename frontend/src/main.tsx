import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import AuthProvider from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { msalConfig } from "./lib/msal/config";
// import "./i18n";

const msalInstance = new PublicClientApplication(msalConfig);

import "./i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          1000 * 60 * 5,  // 5 min — don't refetch fresh data
      gcTime:             1000 * 60 * 10, // 10 min — keep unused cache
      retry:              1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MsalProvider instance={msalInstance}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MsalProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>,
);
