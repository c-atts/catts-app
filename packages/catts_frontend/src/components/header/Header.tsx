import { useSiweIdentity } from "ic-use-siwe-identity";
import EthButton from "./EthButton";
import LoginButton from "./LoginButton";
import ConnectButton from "./ConnectButton";
import { Link } from "@tanstack/react-router";
import { Chain } from "./Chain";
import { useAccount } from "wagmi";
import CreateDialog from "./CreateDialog";

export default function Header() {
  const { identity } = useSiweIdentity();
  const { chain, isConnected, address } = useAccount();

  return (
    <div className="flex flex-col w-[1250px] gap-10 pb-10">
      <div className="flex flex-col justify-between gap-10 pt-10 md:flex-row md:items-center">
        <div className="flex items-center gap-10">
          <div>
            <Link
              className="text-xl font-medium transition-all hover:text-muted-foreground"
              to="/"
            >
              C–ATTS
            </Link>
          </div>
          <div>
            <Link
              className="text-sm font-medium transition-all hover:text-muted-foreground"
              to="/explorer"
            >
              Explorer
            </Link>
          </div>
          {address && (
            <div>
              <Link
                className="text-sm font-medium transition-all hover:text-muted-foreground"
                params={{ address }}
                to="/user/$address"
              >
                My Dashboard
              </Link>
            </div>
          )}
          {!address && (
            <div className="text-sm font-medium transition-all text-muted-foreground/50">
              My Dashboard
            </div>
          )}
          <div>
            <a
              className="text-sm font-medium transition-all hover:text-muted-foreground"
              href="https://docs.catts.run"
              rel="noreferrer"
              target="_blank"
            >
              Docs
            </a>
          </div>
          <CreateDialog />
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
