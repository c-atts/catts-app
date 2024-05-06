import { atom } from "jotai";

export const welcomeMessageShownAtom = atom<boolean>(false);
export const routeAtom = atom<string>("/");
