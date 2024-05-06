import { useSiweIdentity } from "ic-use-siwe-identity";
import EthButton from "./EthButton";
import WrongNetworkButton from "./WrongNetworkButton";
import LoginButton from "./LoginButton";
import ConnectButton from "./ConnectButton";
import HistoryButton from "./HistoryButton";
import useRunContext from "../../context/useRunContext";
import { routeAtom } from "../../state";
import { useSetAtom } from "jotai";

export default function Header() {
  const { identity } = useSiweIdentity();
  const { setSelectedRecipe, resetRun } = useRunContext();
  const setRoute = useSetAtom(routeAtom);

  const handleClick = () => {
    resetRun();
    setSelectedRecipe(undefined);
    setRoute("/");
  };

  return (
    <div className="flex flex-col justify-between w-full gap-10 p-5 md:flex-row">
      <div
        className="hidden text-xl font-bold text-center md:block text-theme-400 cursor-pointer"
        onClick={handleClick}
      >
        C–ATTS
      </div>
      <div className="flex flex-col items-center justify-center gap-5 text-sm md:text-base md:flex-row">
        <ConnectButton />
        {!identity && <LoginButton />}
        {identity && <WrongNetworkButton />}
        <HistoryButton />
        <EthButton />
      </div>
      <div className="block text-xl font-bold text-center md:hidden">
        C–ATTS
      </div>
    </div>
  );
}
