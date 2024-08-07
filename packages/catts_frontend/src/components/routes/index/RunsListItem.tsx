import { formatDistance } from "date-fns";
import { mainnet } from "wagmi/chains";
import { useEnsName } from "wagmi";
import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";
import { Database } from "@/lib/supabase/database.types";

type Run = Database["public"]["Tables"]["run"]["Row"];

export default function RunsListItem({ run }: { run: Run }) {
  const { id, created, creator } = run;

  const { data: creatorEnsName } = useEnsName({
    address: creator as `0x${string}`,
    chainId: mainnet.id,
  });

  const when = formatDistance(new Date(created), new Date(), {
    addSuffix: true,
  });

  return (
    <li
      className="border-[1px] bg-card shadow-sm rounded-lg flex flex-col p-10 w-full mb-5"
      key={id}
    >
      <div className="flex flex-col gap-3">
        <div className="text-2xl font-bold hover:underline  cursor-pointer">
          {id}
        </div>

        <div className="text-sm text-zinc-500">
          {creatorEnsName || shortenEthAddress(creator)} created {when}
        </div>
      </div>
    </li>
  );
}
