import Dialog from "./ui/Dialog";
import { Dialog as HeadlessDialog } from "@headlessui/react";

export default function WelcomeDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <Dialog
      className="relative z-50 w-[650px] max-w-full"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <HeadlessDialog.Title className="text-center text-theme-400 !text-4xl">
        C–ATTS
      </HeadlessDialog.Title>

      <div className="text-center">
        <h3>Move, transform and combine attestations!</h3>
      </div>
      <p className="text-lg leading-8 text-center text-zinc-400">
        Composite attestations are a new type of attestation combining data from
        multiple sources to form a unified and verifiable credential.
      </p>
      <p className="text-lg leading-8 text-center text-zinc-400">
        This is an early demo of what is possible using C–ATTS. Sign in with
        your Ethereum wallet to get started simulating and creating composite
        attestations.
      </p>
    </Dialog>
  );
}
