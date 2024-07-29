import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { SectionTitle } from "@/components/ui/Section";
import useRunContext from "@/context/useRunContext";
import { isChainIdSupported } from "@/wagmi/is-chain-id-supported";
import { LoaderCircle } from "lucide-react";
export default function InitRun({ recipeId }: { recipeId: Uint8Array }) {
  const { identity } = useSiweIdentity();
  const { chainId } = useAccount();
  const {
    initPayAndCreateAttestation,
    inProgress,
    runInProgress,
    errorMessage,
  } = useRunContext();

  const handleClick = () => {
    initPayAndCreateAttestation(recipeId);
  };

  const disabled = !identity || !isChainIdSupported(chainId) || inProgress;

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle>Run recipe</SectionTitle>
      <div>
        Running a recipe means creating an attestation for the currently
        connected address.
      </div>
      <div>
        Creating an attestation takes ca 1 minute and costs ca $0.2 depending on
        chain.
      </div>
      <Button className="mb-4" disabled={disabled} onClick={handleClick}>
        Run
      </Button>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-zinc-300 text-zinc-800">
            1
          </div>
          Initialise run
        </div>
        <div className="pl-10">
          {inProgress && !runInProgress && !errorMessage && (
            <div className="flex justify-between w-full">
              <div>Initialising...</div>
              <div>
                <LoaderCircle className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
          {inProgress && !runInProgress && errorMessage && (
            <div className="flex justify-between w-full">
              <div>Error: {errorMessage}</div>
              <div>🔴</div>
            </div>
          )}
          {inProgress && runInProgress && (
            <div className="flex justify-between w-full">
              <div>Initialised</div>
              <div>✅</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
