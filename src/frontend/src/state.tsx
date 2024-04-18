import { Recipe } from "../../declarations/backend/backend.did";
import { atom } from "jotai";

export const selectedRecipeAtom = atom<Recipe | undefined>(undefined);
