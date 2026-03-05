export const DEFAULT_PR = 0.8;

export function pvKwhDayFromGhiWhM2(ghi_day_wh_m2, kWp, pr = DEFAULT_PR) {
  if (ghi_day_wh_m2 == null) return null;
  return (ghi_day_wh_m2 / 1000) * kWp * pr;
}

export function round2(x) {
  if (x == null || Number.isNaN(x)) return "-";
  return (Math.round(x * 100) / 100).toFixed(2);
}