import { LoaderCircle } from "lucide-react";
import { useSelector } from "@xstate/store/react";
import { runStateStore } from "@/run/RunStateStore";
export default function LoadSchema() {
  const loadSchemaStatus = useSelector(
    runStateStore,
    (state) => state.context.loadSchemaStatus,
  );
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
            1
          </div>
          Load schema
        </div>
        {loadSchemaStatus === "pending" && (
          <div className="flex justify-between w-full pl-10">
            <div>Loading schema...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        {loadSchemaStatus === "error" && (
          <div className="flex justify-between w-full pl-10">
            <div>Couldn't load schema</div>
            <div>🔴</div>
          </div>
        )}
        {loadSchemaStatus === "success" && (
          <div className="flex justify-between w-full pl-10">
            <div>Schema loaded</div>
            <div>✅</div>
          </div>
        )}
      </div>
    </div>
  );
}
