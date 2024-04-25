import { Recipe } from "catts_engine/declarations/catts_engine.did";
import { atom } from "jotai";

export const selectedRecipeAtom = atom<Recipe | undefined>(undefined);
