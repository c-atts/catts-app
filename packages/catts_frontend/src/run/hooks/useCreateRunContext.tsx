import { CreateRunContext } from "../CreateRunContextProvider";
import { CreateRunContextType } from "../types/create-run-context.type";
import { useContext } from "react";

export default function useCreateRunContext(): CreateRunContextType {
  const context = useContext(CreateRunContext);
  if (!context) {
    throw new Error(
      "useRunContext must be used within an CreateRunContextProvider"
    );
  }
  return context;
}
