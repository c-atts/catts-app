import { Badge } from "@/components/ui/badge";

function SchemaBadge({ schemaItem }: { schemaItem: string }) {
  const type = schemaItem.split(" ")[0];
  const name = schemaItem.split(" ")[1];

  return (
    <Badge className="mr-1 bg-secondary">
      {name}: {type}
    </Badge>
  );
}

export default function SchemaBadges({ schema }: { schema?: string }) {
  if (!schema) {
    return null;
  }

  const schemaItems = schema.split(",");

  return (
    <div>
      {schemaItems.map((schemaItem, index) => (
        <SchemaBadge key={index} schemaItem={schemaItem} />
      ))}
    </div>
  );
}
