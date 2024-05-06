import { FormEvent, useEffect, useState } from "react";

import Button from "../ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Pill from "../ui/Pill";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useActor } from "../../ic/Actors";
import { UserProfile } from "catts_engine/declarations/catts_engine.did";

type EditProfileProps = {
  className?: string;
};

export default function Credits({ className }: EditProfileProps) {
  const { actor } = useActor();

  // Local state
  const [profile, setProfile] = useState<UserProfile>();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!actor) return;
      const response = await actor.profile_get_current();
      if (response && "Ok" in response) {
        setProfile(response.Ok);
      }
      setLoading(false);
    })();
  }, [actor]);

  // Don't render form when loading profile
  if (loading)
    return (
      <div className={className}>
        <div className="flex flex-col items-center w-full gap-5 h-72">
          <div className="text-2xl font-bold">User Profile</div>
          <div className="flex flex-col items-center justify-center w-full h-full">
            <FontAwesomeIcon className="w-4 h-4" icon={faCircleNotch} spin />
          </div>
        </div>
      </div>
    );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!actor) return;
    setSaving(true);
    setSaving(false);
  }

  const submitIcon = saving ? faCircleNotch : undefined;

  const submitText = saving ? "Buying" : "Buy";

  const submitDisabled = saving || !profile;

  return (
    <div className={className}>
      <div className="flex flex-col items-center w-full gap-5">
        <div className="text-2xl font-bold">Credits</div>
        <form
          className="flex flex-col items-center w-full gap-5"
          onSubmit={submit}
        >
          <Pill className="bg-zinc-700">{profile?.credits}</Pill>
          <Button
            className="w-full mt-5"
            disabled={submitDisabled}
            icon={submitIcon}
            spin
            type="submit"
            variant="primary"
          >
            {submitText}
          </Button>
        </form>
      </div>
    </div>
  );
}
