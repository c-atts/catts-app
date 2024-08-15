import { createRootRoute, Outlet } from "@tanstack/react-router";
import Header from "../components/header/Header";
import Footer from "@/components/footer/Footer";

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex flex-col items-center flex-grow w-full">
        <Header />
        <Outlet />
      </div>
      <Footer />
    </div>
  ),
});
