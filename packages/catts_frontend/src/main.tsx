import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { canisterId, idlFactory } from "ic_siwe_provider/declarations";

import Actors from "./ic/Actors.tsx";
import App from "./App.tsx";
import AuthGuard from "./AuthGuard.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { RunContextProvider } from "./context/RunContextProvider.tsx";
import { SiweIdentityProvider } from "ic-use-siwe-identity";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { _SERVICE } from "ic_siwe_provider/declarations/ic_siwe_provider.did";
import { GQL_QUERY_STALE_TIME, wagmiConfig } from "./config.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: GQL_QUERY_STALE_TIME, gcTime: GQL_QUERY_STALE_TIME },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SiweIdentityProvider<_SERVICE>
          canisterId={canisterId}
          idlFactory={idlFactory}
        >
          <Actors>
            <AuthGuard>
              <RunContextProvider>
                <App />
              </RunContextProvider>
            </AuthGuard>
          </Actors>
        </SiweIdentityProvider>
      </QueryClientProvider>
    </WagmiProvider>
    <Toaster />
  </React.StrictMode>,
);
