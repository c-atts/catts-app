import { useSiweIdentity } from "ic-use-siwe-identity";
import EthButton from "./EthButton";
import WrongNetworkButton from "./WrongNetworkButton";
import LoginButton from "./LoginButton";
import ConnectButton from "./ConnectButton";
import Button from "../ui/Button";
import { Link } from "@tanstack/react-router";
import { faHistory, faScroll } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const { identity } = useSiweIdentity();

  return (
    <>
      <div className="flex flex-col justify-between w-full gap-10 p-5 md:flex-row">
        <Link to="/">
          <div className="hidden text-xl font-bold text-center md:block text-theme-400 cursor-pointer">
            C–ATTS
          </div>
        </Link>
        <div className="flex flex-col items-center justify-center gap-5 text-sm md:text-base md:flex-row">
          <ConnectButton />
          {!identity && <LoginButton />}
          {identity && <WrongNetworkButton />}
          <EthButton />
        </div>
        <div className="block text-xl font-bold text-center md:hidden">
          C–ATTS
        </div>
      </div>
      <div className="pb-10 w-[750px]">
        <h1 className="text-5xl text-white font-bold leading-[60px] text-center">
          Create, combine, move and transform attestations!
        </h1>
        <div className="flex flex-col items-center gap-5">
          <div>Supports:</div>
          <div className="flex justify-center gap-10 w-full">
            <img className="w-14 h-14" src="/thegraph.svg" />
            <img className="w-14 h-14" src="/eas.png" />
          </div>
        </div>
      </div>
      <div className="w-[750px] flex justify-start gap-5 pb-5">
        <Link to="/">
          <Button icon={faScroll} variant="dark">
            Recipes
          </Button>
        </Link>
        <Link to="/history">
          <Button icon={faHistory} variant="dark" disabled={!identity}>
            Run history
          </Button>
        </Link>
      </div>
    </>
  );
}
