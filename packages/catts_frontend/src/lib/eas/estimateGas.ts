import { CHAIN_CONFIG } from "@/config";
import EasAbi from "../eas/eas.abi.json";
import { ethers, Provider } from "ethers";
import {
  AttestationRequest,
  SchemaEncoder,
  SchemaItem,
} from "@ethereum-attestation-service/eas-sdk";

export async function estimateGas({
  chainId,
  provider,
  schema,
  schemaUid,
  attestationData,
  recipient,
}: {
  chainId: number;
  provider: Provider;
  schema: string;
  schemaUid: string;
  attestationData: SchemaItem[];
  recipient: string;
}) {
  const contractAddress = CHAIN_CONFIG[chainId].easContractAddress;
  const contract = new ethers.Contract(contractAddress, EasAbi, provider);
  const schemaEncoder = new SchemaEncoder(schema);
  const encodedData = schemaEncoder.encodeData(attestationData);

  const attestationRequest: AttestationRequest = {
    schema: schemaUid,
    data: {
      recipient,
      expirationTime: 0n,
      revocable: false,
      refUID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      data: encodedData,
      value: 0n,
    },
  };

  const txData = contract.interface.encodeFunctionData("attest", [
    attestationRequest,
  ]);

  const gas = await provider.estimateGas({
    to: contractAddress,
    data: txData,
  });

  // Add 40% to the gas estimate to ensure the transaction goes through
  // This is a temporary fix until we can figure out why the gas estimate generally is too low
  return (gas * BigInt(140)) / BigInt(100);
}
