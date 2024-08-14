import { LoaderCircle } from "lucide-react";
import { runStateStore } from "@/run/RunStateStore";
import { useSelector } from "@xstate/store/react";
import CreateSchema from "./CreateSchema";
export default function LoadSchema() {
  const { loadSchemaStatus } = useSelector(
    runStateStore,
    (state) => state.context,
  );

  return (
    <div className="flex flex-col">
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
        {loadSchemaStatus === "success" && (
          <div className="flex justify-between w-full pl-10">
            <div>Schema loaded</div>
            <div>✅</div>
          </div>
        )}
      </div>
      <CreateSchema />
    </div>
  );
}
