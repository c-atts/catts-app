import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

export default function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  function copyToClipboard() {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  }

  return (
    <Button
      className={className}
      onClick={copyToClipboard}
      size="tiny-icon"
      variant="round"
    >
      <Copy className="w-3 h-3" />
    </Button>
  );
}
