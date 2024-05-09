import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Header from "../components/header/Header";

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col items-center w-full pb-10">
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  ),
});
