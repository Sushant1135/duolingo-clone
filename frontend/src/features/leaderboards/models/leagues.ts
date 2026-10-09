export type LeagueId =
  | "bronze"
  | "silver"
  | "gold"
  | "sapphire"
  | "ruby"
  | "emerald"
  | "amethyst"
  | "pearl"
  | "obsidian"
  | "diamond";

export type LeagueConfig = {
  id: LeagueId;
  name: string;
  order: number;
  color: string;
  surface: string;
  border: string;
  promotionCount: number;
  demotionCount: number;
};

export const leagues: LeagueConfig[] = [
  { id: "bronze", name: "Bronze", order: 1, color: "#cd7f32", surface: "#fff4e8", border: "#d69045", promotionCount: 3, demotionCount: 0 },
  { id: "silver", name: "Silver", order: 2, color: "#a0a8ad", surface: "#f4f7f8", border: "#b7c0c5", promotionCount: 3, demotionCount: 2 },
  { id: "gold", name: "Gold", order: 3, color: "#ffc700", surface: "#fff8d6", border: "#e5b300", promotionCount: 3, demotionCount: 2 },
  { id: "sapphire", name: "Sapphire", order: 4, color: "#49c0f8", surface: "#e7f7ff", border: "#1cb0f6", promotionCount: 3, demotionCount: 2 },
  { id: "ruby", name: "Ruby", order: 5, color: "#ee5555", surface: "#ffebee", border: "#dc3d3d", promotionCount: 3, demotionCount: 2 },
  { id: "emerald", name: "Emerald", order: 6, color: "#58cc02", surface: "#e8ffd8", border: "#46a302", promotionCount: 3, demotionCount: 2 },
  { id: "amethyst", name: "Amethyst", order: 7, color: "#ce82ff", surface: "#f5e6ff", border: "#a549e8", promotionCount: 3, demotionCount: 2 },
  { id: "pearl", name: "Pearl", order: 8, color: "#f5f2e8", surface: "#fffdf5", border: "#d8d2c4", promotionCount: 3, demotionCount: 2 },
  { id: "obsidian", name: "Obsidian", order: 9, color: "#55515f", surface: "#eceaf0", border: "#3f3b49", promotionCount: 3, demotionCount: 3 },
  { id: "diamond", name: "Diamond", order: 10, color: "#38eeff", surface: "#e5fdff", border: "#1cb0f6", promotionCount: 0, demotionCount: 3 },
];

export const getLeagueConfig = (name?: string) =>
  leagues.find((league) => league.name.toLowerCase() === (name || "").toLowerCase()) || leagues[0];
