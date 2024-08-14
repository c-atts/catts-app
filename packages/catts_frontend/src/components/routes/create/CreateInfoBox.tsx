import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateInfoBox() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About recipes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        A C–ATTS recipe defines the queries and the processing logic needed to
        create a composite attestation.{" "}
        <p>
          Before uploading it here, create the recipe locally using the C–ATS
          CLI. For more details, see the{" "}
          <a
            className="classic-link"
            href="https://docs.catts.run"
            rel="noreferrer"
            target="_blank"
          >
            C–ATTS documentation
          </a>{" "}
          or the{" "}
          <a
            className="classic-link"
            href="https://github.com/c-atts/catts-recipes"
            rel="noreferrer"
            target="_blank"
          >
            C–ATTS recipe repository on GitHub
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}
