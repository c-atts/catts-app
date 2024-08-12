import { ethers } from "ethers";

export function decodeData({
  data,
  schema,
}: {
  data?: string;
  schema: string;
}) {
  if (!data) {
    return null;
  }
  const schemaItems = schema.split(",");
  const abiTypes = schemaItems.map((item) => item.split(" ")[0]);
  return ethers.AbiCoder.defaultAbiCoder().decode(abiTypes, data);
}
