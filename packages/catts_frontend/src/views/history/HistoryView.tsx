import BackButton from "../../components/BackButton";
import Section from "../../components/ui/Section";
import RunHistory from "../main/components/RunHistory";

export default function HistoryView() {
  return (
    <Section>
      <div className="flex flex-col gap-5 p-5">
        <BackButton />
        <RunHistory />
      </div>
    </Section>
  );
}
