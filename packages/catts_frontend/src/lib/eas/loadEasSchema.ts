import { CHAIN_CONFIG, wagmiConfig } from "@/config";
import { getChainId } from "@wagmi/core";
import {
  getSchemaUID,
  SchemaRegistry,
} from "@ethereum-attestation-service/eas-sdk";
import { JsonRpcSigner } from "ethers";

export async function loadEasSchema({
  schema,
  resolver,
  signer,
}: {
  schema: string;
  resolver: string;
  signer: JsonRpcSigner;
}) {
  const chainId = getChainId(wagmiConfig);
  const schemaUid = getSchemaUID(schema, resolver, false);

  const schemaRegistry = new SchemaRegistry(
    CHAIN_CONFIG[chainId].easRegistryAddress,
  );
  schemaRegistry.connect(signer);
  try {
    return schemaRegistry.getSchema({ uid: schemaUid });
  } catch (e) {
    console.error(e);
  }
}
