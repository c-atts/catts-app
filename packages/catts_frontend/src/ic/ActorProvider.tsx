/* eslint-disable react-refresh/only-export-components */
import {
  ActorProvider as _ActorProvider,
  InterceptorErrorData,
  InterceptorRequestData,
  createActorContext,
  createUseActorHook,
  isIdentityExpiredError,
  InterceptorResponseData,
} from "ic-use-actor";
import { canisterId, idlFactory } from "catts_engine/declarations";

import { ReactNode } from "react";
import { _SERVICE } from "catts_engine/declarations/catts_engine.did";
import toast from "react-hot-toast";
import { useSiweIdentity } from "ic-use-siwe-identity";

const actorContext = createActorContext<_SERVICE>();
export const useActor = createUseActorHook<_SERVICE>(actorContext);

export default function ActorProvider({ children }: { children: ReactNode }) {
  const { identity, clear } = useSiweIdentity();

  const errorToast = (error: unknown) => {
    if (typeof error === "object" && error !== null && "message" in error) {
      toast.error(error.message as string, {
        position: "bottom-right",
      });
    }
  };

  const handleResponseError = (data: InterceptorErrorData) => {
    console.error("onResponseError", data.methodName, data.args, data.error);
    if (isIdentityExpiredError(data.error)) {
      toast.error("Login expired.", {
        id: "login-expired",
        position: "bottom-right",
      });
      setTimeout(() => {
        clear(); // Clears the identity from the state and local storage. Effectively "logs the user out".
        window.location.reload(); // Reload the page to reset the UI.
      }, 1000);
      return;
    }
    throw data.error;
  };

  const handleRequest = (data: InterceptorRequestData) => {
    if (import.meta.env.DEV) {
      console.log("onRequest", data.methodName, data.args);
    }
    return data.args;
  };

  const handleResponse = (data: InterceptorResponseData) => {
    if (import.meta.env.DEV) {
      console.log("onResponse", data.methodName, data.args, data.response);
    }
    return data.response;
  };

  return (
    <_ActorProvider<_SERVICE>
      canisterId={canisterId}
      context={actorContext}
      identity={identity}
      idlFactory={idlFactory}
      onRequest={handleRequest}
      onRequestError={(error) => errorToast(error)}
      onResponse={handleResponse}
      onResponseError={handleResponseError}
    >
      {children}
    </_ActorProvider>
  );
}
