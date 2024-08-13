import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import AttestationData from "./AttestationData";
import { CHAIN_CONFIG } from "@/config";
import CopyButton from "@/components/CopyButton";
import { InfoIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import SchemaBadges from "./SchemaBadges";
import { decodeData } from "@/lib/eas/hooks/decodeData";
import { useAttestation } from "@/lib/eas/hooks/useAttestation";
import { useGetRecipeById } from "@/recipe/hooks/useGetRecipeById";
import { useGetRunById } from "@/run/hooks/useGetRunById";
import useRunContext from "@/run/hooks/useRunContext";

export default function AttestationDetails() {
  const { runId } = useRunContext();
  const { data: run } = useGetRunById(runId);
  const { data: recipe } = useGetRecipeById(run?.recipe_id);
  const { data: attestation } = useAttestation({
    chainId: run?.chain_id,
    uid: run?.attestation_uid,
  });

  if (!run || !recipe) {
    return null;
  }

  const { chain_id, attestation_transaction_hash, attestation_uid } = run;
  const { schema } = recipe;

  const attestationTransactionUrl = `${CHAIN_CONFIG[chain_id].blockExplorerUrl}/tx/${attestation_transaction_hash}`;
  const attestationUidUrl = `${CHAIN_CONFIG[chain_id].easExplorerUrl}/attestation/view/${attestation_uid}`;
  const decodedData = decodeData({ data: attestation?.data, schema });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attestation details</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col w-full gap-3 text-sm">
          <div className="flex w-full">
            <div className="flex items-center w-1/4 text-foreground/50">
              Attestation transaction:
            </div>
            {!attestation_transaction_hash && (
              <div className="flex items-center text-blue-800">
                <InfoIcon className="inline-block w-4 h-4 mr-1" />
                No attestation has been created.
              </div>
            )}

            {attestation_transaction_hash && (
              <div className="flex items-center w-3/4 ml-2">
                <Link
                  className="classic-link"
                  target="_blank"
                  to={attestationTransactionUrl}
                >
                  {attestation_transaction_hash}
                </Link>
                <CopyButton
                  className="ml-1"
                  value={attestation_transaction_hash}
                />
              </div>
            )}
          </div>
          {attestation_uid && (
            <div className="flex w-full">
              <div className="flex items-center w-1/4 text-foreground/50">
                Attestation UID:
              </div>
              <div className="flex items-center w-3/4 ml-2">
                <Link
                  className="classic-link"
                  target="_blank"
                  to={attestationUidUrl}
                >
                  {attestation_uid}
                </Link>
                <CopyButton className="ml-1" value={attestation_uid} />
              </div>
            </div>
          )}
          {schema && (
            <div className="flex w-full">
              <div className="flex items-center w-1/4 text-foreground/50">
                Schema:
              </div>
              <div className="flex items-center w-3/4 ml-2">
                <SchemaBadges schema={schema} />
              </div>
            </div>
          )}
          {decodedData && (
            <AttestationData data={decodedData} schema={schema} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
