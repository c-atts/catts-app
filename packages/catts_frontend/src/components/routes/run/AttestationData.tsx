import { ethers } from "ethers";

function AttestationDataItem({
  schemaItem,
  data,
}: {
  schemaItem: string;
  data: string;
}) {
  const type = schemaItem.split(" ")[1];

  return (
    <div className="flex w-full">
      <div className="flex items-center w-1/4 text-foreground/50">{type}</div>
      <div className="flex items-center w-3/4 ml-2">{data.toString()}</div>
    </div>
  );
}

export default function AttestationData({
  data,
  schema,
}: {
  data: ethers.Result;
  schema: string;
}) {
  if (!data) {
    return null;
  }

  const schemaItems = schema.split(",");
  return (
    <div>
      <h3>Attestation Data</h3>
      <div className="flex flex-col w-full gap-3">
        {schemaItems.map((item, index) => (
          <AttestationDataItem
            data={data[index]}
            key={index}
            schemaItem={item}
          />
        ))}
      </div>
    </div>
  );
}
