import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Header from "../components/header/Header";
import GitHubIcon from "../components/GitHubIcon";

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col items-center w-full pb-10">
      <Header />
      <Outlet />
      <GitHubIcon />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  ),
});
