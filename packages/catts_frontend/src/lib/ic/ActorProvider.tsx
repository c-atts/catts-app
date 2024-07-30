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
import { useSiweIdentity } from "ic-use-siwe-identity";
import errorToast from "../util/errorToast";

const actorContext = createActorContext<_SERVICE>();
export const useActor = createUseActorHook<_SERVICE>(actorContext);

export default function ActorProvider({ children }: { children: ReactNode }) {
  const { identity, clear } = useSiweIdentity();

  const handleRequest = (data: InterceptorRequestData) => {
    if (import.meta.env.DEV) {
      console.log("onRequest", data.methodName, data.args);
    }
    return data.args;
  };

  const handleRequestError = (data: InterceptorErrorData) => {
    console.error("onRequestError", data.methodName, data.args, data.error);
    errorToast({
      error: data.error,
      message: "Request error",
    });
    throw data.error;
  };

  const handleResponse = (data: InterceptorResponseData) => {
    if (import.meta.env.DEV) {
      console.log("onResponse", data.methodName, data.args, data.response);
    }
    return data.response;
  };

  const handleResponseError = (data: InterceptorErrorData) => {
    console.error("onResponseError", data.methodName, data.args, data.error);
    if (isIdentityExpiredError(data.error)) {
      errorToast({
        error: data.error,
        message: "Login expired",
      });
      setTimeout(() => {
        clear(); // Clears the identity from the state and local storage. Effectively "logs the user out".
        window.location.reload(); // Reload the page to reset the UI.
      }, 1000);
      return;
    }
    throw data.error;
  };

  return (
    <_ActorProvider<_SERVICE>
      canisterId={canisterId}
      context={actorContext}
      identity={identity}
      idlFactory={idlFactory}
      onRequest={handleRequest}
      onRequestError={handleRequestError}
      onResponse={handleResponse}
      onResponseError={handleResponseError}
    >
      {children}
    </_ActorProvider>
  );
}
