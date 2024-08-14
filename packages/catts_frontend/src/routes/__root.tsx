import { createRootRoute, Outlet } from "@tanstack/react-router";
import Header from "../components/header/Header";
import Footer from "@/components/footer/Footer";

export const Route = createRootRoute({
  component: () => (
    <div className="w-full flex flex-col min-h-screen">
      <div className="flex flex-col items-center w-[1250px] pb-10 m-auto flex-grow">
        <Header />
        <Outlet />
      </div>
      <Footer />
    </div>
  ),
});
