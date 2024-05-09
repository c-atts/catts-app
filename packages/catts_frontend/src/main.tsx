import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { canisterId, idlFactory } from "ic_siwe_provider/declarations";

import ActorProvider from "./ic/ActorProvider";
import AuthGuard from "./AuthGuard.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { RunContextProvider } from "./context/RunContextProvider.tsx";
import { SiweIdentityProvider } from "ic-use-siwe-identity";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { _SERVICE } from "ic_siwe_provider/declarations/ic_siwe_provider.did";
import { GQL_QUERY_STALE_TIME, wagmiConfig } from "./config.ts";
import { RouterProvider, createRouter } from "@tanstack/react-router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: GQL_QUERY_STALE_TIME, gcTime: GQL_QUERY_STALE_TIME },
  },
});

import { routeTree } from "./routeTree.gen";
const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SiweIdentityProvider<_SERVICE>
          canisterId={canisterId}
          idlFactory={idlFactory}
        >
          <ActorProvider>
            <AuthGuard>
              <RunContextProvider>
                <RouterProvider router={router} />
              </RunContextProvider>
            </AuthGuard>
          </ActorProvider>
        </SiweIdentityProvider>
      </QueryClientProvider>
    </WagmiProvider>
    <Toaster />
  </React.StrictMode>,
);
