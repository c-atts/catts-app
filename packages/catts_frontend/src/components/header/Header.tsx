import { useSiweIdentity } from "ic-use-siwe-identity";
import EthButton from "./EthButton";
import LoginButton from "./LoginButton";
import ConnectButton from "./ConnectButton";
import { Link } from "@tanstack/react-router";
import { Chain } from "./Chain";
import { useAccount } from "wagmi";
import CreateDialog from "./CreateDialog";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useState } from "react";

export default function Header() {
  const { identity } = useSiweIdentity();
  const { chain, isConnected, address } = useAccount();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden flex w-full justify-between p-5 pb-10">
        <Sheet onOpenChange={setOpen} open={open}>
          <SheetTrigger className="md">
            <img
              alt="C–ATTS Logo"
              className="w-10 h-10"
              onClick={() => setOpen(true)}
              src="/catts-icon.svg"
            />
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-5" side="left">
            <div className="p-5">
              <Link
                className="text-2xl font-medium transition-all hover:text-muted-foreground"
                onClick={() => setOpen(false)}
                to="/"
              >
                C–ATTS
              </Link>
            </div>
            <div className="p-5">
              <Link
                className="text-xl font-medium transition-all hover:text-muted-foreground"
                onClick={() => setOpen(false)}
                to="/explorer"
              >
                Explorer
              </Link>
            </div>
            {address && (
              <div className="p-5">
                <Link
                  className="text-xl font-medium transition-all hover:text-muted-foreground"
                  onClick={() => setOpen(false)}
                  params={{ address }}
                  to="/user/$address"
                >
                  My Dashboard
                </Link>
              </div>
            )}
            {!address && (
              <div className="p-5">
                <div className="text-xl font-medium transition-all text-muted-foreground/50">
                  My Dashboard
                </div>
              </div>
            )}
            <div className="p-5">
              <a
                className="text-xl font-medium transition-all hover:text-muted-foreground"
                href="https://docs.catts.run"
                onClick={() => setOpen(false)}
                rel="noreferrer"
                target="_blank"
              >
                Docs
              </a>
            </div>
            <CreateDialog />
          </SheetContent>
        </Sheet>
        <div>
          <Link
            className="text-xl font-medium transition-all hover:text-muted-foreground"
            to="/"
          >
            C–ATTS
          </Link>
        </div>
      </div>

      <div className="hidden md:flex w-full xl:w-[1280px] justify-between pb-10 px-5 xl:px-0 md:pt-5">
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
        <div className="flex items-center justify-center gap-5 text-sm md:text-base flex-row">
          {!isConnected && <ConnectButton />}
          {chain && !identity && <LoginButton />}
          {isConnected && <Chain />}
          <EthButton />
        </div>
      </div>
    </>
  );
}
