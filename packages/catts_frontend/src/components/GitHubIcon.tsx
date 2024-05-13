import { faGithub, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function GitHubIcon() {
  return (
    <div className="flex flex-row items-center justify-center w-full gap-5 pt-10">
      <a href="https://github.com/c-atts" rel="noreferrer" target="_blank">
        <FontAwesomeIcon
          className="w-10 h-10 mx-3 text-zinc-500"
          icon={faGithub}
        />
      </a>
      <a href="https://twitter.com/c_atts" rel="noreferrer" target="_blank">
        <FontAwesomeIcon
          className="w-10 h-10 mx-3 text-zinc-500"
          icon={faXTwitter}
        />
      </a>
    </div>
  );
}
