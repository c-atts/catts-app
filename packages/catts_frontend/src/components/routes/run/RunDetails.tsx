import { Link } from "@tanstack/react-router";
import { useGetRunById } from "@/run/hooks/useGetRunById";
import useRunContext from "@/run/hooks/useRunContext";
import { Card, CardContent } from "@/components/ui/card";
import CopyButton from "@/components/CopyButton";
import UserLink from "@/components/UserLink";
import { formatDistance } from "date-fns";
import { ChainIcon } from "@/components/ChainIcon";
import { CHAIN_CONFIG } from "@/config";
import { CircleAlert, InfoIcon, TriangleAlert } from "lucide-react";
import { formatEther, hexToBigInt } from "viem";
import { formatNumber } from "@/lib/util/number";

export default function RunDetails() {
  const { runId } = useRunContext();
  const { data: run } = useGetRunById(runId);

  if (!run) {
    return null;
  }

  const {
    creator,
    created,
    id,
    recipe,
    chain_id,
    gas,
    user_fee,
    payment_transaction_hash,
    error,
    is_cancelled,
  } = run;

  const createdDate = new Date(created);
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });

  const chainName = CHAIN_CONFIG[chain_id]?.name;

  const formattedGas = formatNumber(hexToBigInt(gas as `0x${string}`));
  const formattedUserFee = formatNumber(
    Number.parseFloat(formatEther(hexToBigInt(user_fee as `0x${string}`))),
  );
  const nativeTokenName = CHAIN_CONFIG[chain_id]?.nativeTokenName;
  const paymentUrl = `${CHAIN_CONFIG[chain_id]?.blockExplorerUrl}/tx/${payment_transaction_hash}`;

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 mt-6">
        <div className="flex flex-col gap-5">
          <UserLink address={creator} />
          <h3 className="text-2xl font-semibold leading-none tracking-tight mt-0 mb-0">
            Run details
          </h3>
          <div className="flex flex-col w-full gap-3 text-sm">
            <div className="flex w-full">
              <div className="w-1/4 text-foreground/50 flex items-center">
                Run Id:
              </div>
              <div className="w-3/4 flex items-center ml-2">
                {id} <CopyButton className="ml-1" value={id} />
              </div>
            </div>
            <div className="flex w-full">
              <div className="w-1/4 text-foreground/50">Created:</div>
              <div className="w-3/4 ml-2">{when}</div>
            </div>
            {recipe?.name && (
              <div className="flex w-full">
                <div className="w-1/4 text-foreground/50">Recipe:</div>
                <div className="w-3/4 ml-2">
                  <Link
                    className="classic-link"
                    params={{ recipeName: recipe.name }}
                    to="/recipe/$recipeName"
                  >
                    {" "}
                    {recipe.name}
                  </Link>
                </div>
              </div>
            )}
            <div className="flex w-full">
              <div className="w-1/4 text-foreground/50">Chain:</div>
              <div className="w-3/4 ml-2 flex items-center">
                <ChainIcon
                  chainId={chain_id}
                  className="w-4 h-4 inline-block mr-1"
                />{" "}
                {chainName}
              </div>
            </div>
            <div className="flex w-full">
              <div className="w-1/4 text-foreground/50">Gas:</div>
              <div className="w-3/4 ml-2">{formattedGas}</div>
            </div>
            <div className="flex w-full">
              <div className="w-1/4 text-foreground/50">User fee:</div>
              <div className="w-3/4 ml-2">
                {formattedUserFee} {nativeTokenName}
              </div>
            </div>
            <div className="flex w-full">
              <div className="w-1/4 text-foreground/50">Payment tx:</div>
              <div className="w-3/4 ml-2">
                {payment_transaction_hash ? (
                  <div className="flex gap-2 items-center">
                    <Link
                      className="classic-link block truncate"
                      target="_blank"
                      to={paymentUrl}
                    >
                      {payment_transaction_hash}
                    </Link>
                    <CopyButton
                      className="ml-1"
                      value={payment_transaction_hash}
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-blue-800">
                    <InfoIcon className="w-4 h-4 mr-1 inline-block" />
                    This run has not been paid yet.
                  </div>
                )}
              </div>
            </div>
            {is_cancelled && (
              <div className="flex w-full">
                <div className="w-1/4 text-foreground/50">Cancelled:</div>
                <div className="w-3/4 ml-2 flex items-center">
                  <CircleAlert className="w-4 h-4 mr-1" />
                  This run was cancelled by the user.
                </div>
              </div>
            )}
            {error && (
              <div className="flex w-full">
                <div className="w-1/4 text-foreground/50">Error:</div>
                <div className="w-3/4 ml-2 flex items-center text-red-500">
                  <TriangleAlert className="w-4 h-4 mr-1" />
                  {error}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
