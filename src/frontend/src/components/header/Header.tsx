import EthButton from "./EthButton";
import IdentityButton from "./IdentityButton";
import SessionButton from "./SessionButton";

export default function Header() {
  return (
    <div className="flex flex-col justify-between w-full gap-10 p-5 md:flex-row">
      <div className="hidden text-xl font-bold text-center md:block">
        C–ATTS
      </div>
      <div className="flex flex-col items-center justify-center gap-5 text-sm md:text-base md:flex-row">
        <IdentityButton />
        <EthButton />
        <SessionButton />
      </div>
      <div className="block text-xl font-bold text-center md:hidden">
        C–ATTS
      </div>
    </div>
  );
}
