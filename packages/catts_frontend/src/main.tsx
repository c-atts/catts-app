import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { canisterId, idlFactory } from "ic_siwe_provider/declarations";

import AuthGuard from "./AuthGuard.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
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
import ActorProvider from "./lib/ic/ActorProvider.tsx";
import { SupabaseProvider } from "./lib/supabase/SupabaseContext.tsx";
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
          <SupabaseProvider>
            <ActorProvider>
              <AuthGuard>
                <RouterProvider router={router} />
              </AuthGuard>
            </ActorProvider>
          </SupabaseProvider>
        </SiweIdentityProvider>
      </QueryClientProvider>
    </WagmiProvider>
    <Toaster position="top-center" />
  </React.StrictMode>,
);
