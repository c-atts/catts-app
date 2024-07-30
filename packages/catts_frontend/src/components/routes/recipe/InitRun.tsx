import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { SectionTitle } from "@/components/ui/Section";
import { LoaderCircle } from "lucide-react";
import useRunContext from "@/run/hooks/useRunContext";
import { isChainIdSupported } from "@/lib/wagmi/is-chain-id-supported";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
export default function InitRun() {
  const { recipe } = useRecipeContext();
  const { identity } = useSiweIdentity();
  const { chainId } = useAccount();
  const {
    initPayAndCreateAttestation,
    inProgress,
    runInProgress,
    errorMessage,
  } = useRunContext();

  if (!recipe) {
    return null;
  }

  const handleClick = () => {
    initPayAndCreateAttestation(recipe.id as Uint8Array);
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
