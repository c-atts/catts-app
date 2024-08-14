import { useSiweIdentity } from "ic-use-siwe-identity";
import EthButton from "./EthButton";
import LoginButton from "./LoginButton";
import ConnectButton from "./ConnectButton";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Chain } from "./Chain";
import { useAccount } from "wagmi";
import { Plus } from "lucide-react";

export default function Header() {
  const { identity } = useSiweIdentity();
  const { chain, isConnected, address } = useAccount();

  return (
    <div className="flex flex-col gap-10 w-full pb-14">
      <div className="flex flex-col justify-between gap-10 pt-10 md:flex-row md:items-center">
        <div className="flex gap-5 items-center">
          <Link to="/">
            <div className="hidden text-xl font-medium text-center md:block text-theme-400 cursor-pointer">
              C–ATTS
            </div>
          </Link>
          <Link search={{ page: 1 }} to="/recipes">
            <Button variant="ghost">Recipes</Button>
          </Link>
          <Link search={{ page: 1 }} to="/runs">
            <Button variant="ghost">Runs</Button>
          </Link>
          {address && (
            <Link params={{ address }} to="/user/$address">
              <Button variant="ghost">My Dashboard</Button>
            </Link>
          )}
          {!address && (
            <Button disabled variant="ghost">
              My Dashboard
            </Button>
          )}
          <Link disabled={!identity} to="/create">
            <Button disabled={!identity}>
              <Plus className="w-4 h-4 mr-2" />
              Create Recipe
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center gap-5 text-sm md:text-base md:flex-row">
          {!isConnected && <ConnectButton />}
          {chain && !identity && <LoginButton />}
          {isConnected && <Chain />}
          <EthButton />
        </div>
      </div>
    </div>
  );
}
