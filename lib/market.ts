export const MARKET_API = "/api/market";

export type PriceChange = {
  dir: "up" | "down" | "flat";
  pct: number;
};

export type MarketPrice = {
  market: string;
  division: string;
  min: number;
  max: number;
};

export type Product = {
  id: number;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn: string;
  categoryIcon: string;
  unit: "kg" | "litre" | "dozen" | "piece" | string;
  image: string;
  today: number;
  yesterday: number;
  lastWeek?: number;
  lastMonth?: number;
  change: PriceChange;
  markets: MarketPrice[];
  description?: string;
};

export type Category = {
  id: string;
  slug: string;
  nameBn: string;
  icon: string;
};

export const bnNumber = (value: number, maximumFractionDigits = 1) =>
  new Intl.NumberFormat("bn-BD", { maximumFractionDigits }).format(value);

export const unitLabel = (unit: Product["unit"]) => {
  if (unit === "kg") return "প্রতি কেজি";
  if (unit === "litre") return "প্রতি লিটার";
  if (unit === "dozen") return "প্রতি ডজন";
  if (unit === "piece") return "প্রতি পিস";
  return `প্রতি ${unit}`;
};

export const priceLabel = (value: number) => `${bnNumber(value, 0)} টাকা`;

export const getChangeLabel = (change: PriceChange) => {
  if (change.dir === "flat" || change.pct === 0) return "—০.০%";
  return `${change.dir === "up" ? "▲" : "▼"} ${bnNumber(Math.abs(change.pct))}%`;
};
