import { useSiweIdentity } from "ic-use-siwe-identity";
import EthButton from "./EthButton";
import IdentityButton from "./IdentityButton";
import WrongNetworkButton from "./WrongNetworkButton";

export default function Header() {
  const { identity } = useSiweIdentity();
  return (
    <div className="flex flex-col justify-between w-full gap-10 p-5 md:flex-row">
      <div className="hidden text-xl font-bold text-center md:block text-theme-400">
        C–ATTS
      </div>
      <div className="flex flex-col items-center justify-center gap-5 text-sm md:text-base md:flex-row">
        {identity && <WrongNetworkButton />}
        <IdentityButton />
        <EthButton />
      </div>
      <div className="block text-xl font-bold text-center md:hidden">
        C–ATTS
      </div>
    </div>
  );
}
