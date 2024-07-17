import { useSiweIdentity } from "ic-use-siwe-identity";
import EthButton from "./EthButton";
import WrongNetworkButton from "./WrongNetworkButton";
import LoginButton from "./LoginButton";
import ConnectButton from "./ConnectButton";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
// import { faHistory, faPlus, faScroll } from "@fortawesome/free-solid-svg-icons";
import { Chain } from "./Chain";

export default function Header() {
  const { identity } = useSiweIdentity();

  return (
    <div className="flex flex-col gap-10 w-[1250px]">
      <div className="flex flex-col justify-between gap-10 pt-10 md:flex-row md:items-center">
        <div className="flex gap-5 items-baseline">
          <Link to="/">
            <div className="hidden text-xl font-bold text-center md:block text-theme-400 cursor-pointer">
              C–ATTS
            </div>
          </Link>
          <Link to="/">Recipes</Link>
          <div>My Dashboard</div>
        </div>
        <div className="flex flex-col items-center justify-center gap-5 text-sm md:text-base md:flex-row">
          <ConnectButton />
          {!identity && <LoginButton />}
          {identity && <WrongNetworkButton />}
          <Chain />
          <EthButton />
        </div>
        <div className="block text-xl font-bold text-center md:hidden">
          C–ATTS
        </div>
      </div>
      <div className="flex w-full justify-end pb-10">
        <Link to="/create">
          <Button>Create Recipe</Button>
        </Link>
      </div>
    </div>
  );
}
