import { createContext, useContext, ReactNode } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./createClient";
import { Database } from "./database.types";

type SupabaseProviderProps = {
  children: ReactNode;
};

const SupabaseContext = createContext<SupabaseClient | undefined>(undefined);

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseClient<Database> => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
