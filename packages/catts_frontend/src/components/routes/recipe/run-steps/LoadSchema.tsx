import { LoaderCircle } from "lucide-react";
import { runStateStore } from "@/run/RunStateStore";
import { useSelector } from "@xstate/store/react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import HelpTooltip from "@/components/HelpTooltip";
export default function LoadSchema() {
  const { loadSchemaStatus, errorMessage } = useSelector(
    runStateStore,
    (state) => state.context,
  );
  const { chain } = useAccount();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
            1
          </div>
          Load schema
        </div>
        {loadSchemaStatus === "pending" && (
          <div className="flex justify-between w-full pl-10">
            <div>Loading schema...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        {loadSchemaStatus === "error" && errorMessage && (
          <div className="flex flex-col gap-3">
            <div className="pl-10">
              An attestation schema for this recipe is not yet available on{" "}
              <b>{chain?.name}</b>.
              <HelpTooltip>
                <p>
                  Schemas define the structure and type of data that can be
                  included in an attestation. They act as a blueprint for the
                  information being attested to, ensuring consistency and
                  clarity.
                </p>
                <p>
                  A recipe schema only needs to be created once per supported
                  chain.
                </p>
                <p>
                  <a
                    className="classic-link"
                    href="https://docs.attest.org/docs/core--concepts/schemas"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Learn more about EAS schemas
                  </a>
                </p>
              </HelpTooltip>
            </div>
            <div className="flex w-full pl-10">
              <Button size="sm">Create schema</Button>
            </div>
          </div>
        )}
        {loadSchemaStatus === "success" && (
          <div className="flex justify-between w-full pl-10">
            <div>Schema loaded</div>
            <div>✅</div>
          </div>
        )}
      </div>
    </div>
  );
}
