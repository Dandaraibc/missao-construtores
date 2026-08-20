export type SkinTone = "light" | "medium-light" | "medium" | "medium-dark" | "dark";
export type HairStyle = "straight-short" | "straight-medium" | "curly" | "afro" | "bald" | "bun" | "cap";
export type Outfit = "uniform" | "casual";
export type Accessory = "none" | "cap" | "glasses";

export interface AvatarConfig {
  skinTone: SkinTone;
  hairStyle: HairStyle;
  outfit: Outfit;
  accessory: Accessory;
  name: string;
}

export const SKIN_TONES: { id: SkinTone; label: string; color: string }[] = [
  { id: "light", label: "Claro", color: "#FDDBB4" },
  { id: "medium-light", label: "Médio-claro", color: "#E0AC69" },
  { id: "medium", label: "Médio", color: "#C68642" },
  { id: "medium-dark", label: "Médio-escuro", color: "#8D5524" },
  { id: "dark", label: "Escuro", color: "#5C3317" },
];

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: "straight-short", label: "Liso curto" },
  { id: "straight-medium", label: "Liso médio" },
  { id: "curly", label: "Cacheado" },
  { id: "afro", label: "Black power" },
  { id: "bald", label: "Careca" },
  { id: "bun", label: "Preso / Coque" },
  { id: "cap", label: "Boné" },
];

export const OUTFITS: { id: Outfit; label: string }[] = [
  { id: "uniform", label: "Uniforme Colégio 24 de Maio" },
  { id: "casual", label: "Casual" },
];

export const ACCESSORIES: { id: Accessory; label: string }[] = [
  { id: "none", label: "Nenhum" },
  { id: "cap", label: "Boné" },
  { id: "glasses", label: "Óculos" },
];
