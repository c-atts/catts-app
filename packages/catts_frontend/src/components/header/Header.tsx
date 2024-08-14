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
    <div className="flex flex-col w-full gap-10 pb-14">
      <div className="flex flex-col justify-between gap-10 pt-10 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <Link to="/">
            <div className="hidden text-xl font-medium text-center cursor-pointer md:block text-theme-400">
              C–ATTS
            </div>
          </Link>
          <Link
            className="relative text-sm font-medium transition-all hover:text-muted-foreground"
            to="/explorer"
          >
            Explorer
          </Link>
          {address && (
            <Link
              className="relative text-sm font-medium transition-all hover:text-muted-foreground"
              params={{ address }}
              to="/user/$address"
            >
              My Dashboard
            </Link>
          )}
          {!address && (
            <div className="relative text-sm font-medium transition-all text-muted-foreground/50">
              My Dashboard
            </div>
          )}
          <a
            className="relative text-sm font-medium transition-all hover:text-muted-foreground"
            href="https://docs.catts.run"
            rel="noreferrer"
            target="_blank"
          >
            Docs
          </a>
          <Link disabled={!identity} to="/create">
            <Button className="rounded-full" disabled={!identity} size="sm">
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
