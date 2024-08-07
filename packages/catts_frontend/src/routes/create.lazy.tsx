import { createLazyFileRoute } from "@tanstack/react-router";
import CreateForm from "../components/routes/create/CreateForm";
import { Section } from "@/components/ui/Section";

export const Route = createLazyFileRoute("/create")({
  component: Index,
});

function InfoSection() {
  return (
    <Section>
      To create a recipe, paste the URL of a publicly accessible folder
      containing recipe definitions. .... Link to github repo Link to docs
    </Section>
  );
}

function Index() {
  return (
    <div className="flex gap-5 w-full">
      <div className="flex flex-col gap-5 w-2/3">
        <CreateForm />
      </div>
      <div className="w-1/3">
        <InfoSection />
      </div>
    </div>
  );
}
