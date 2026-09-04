export const statuses = ["Prospect", "Current", "Former"] as const;
export type ClientStatus = (typeof statuses)[number];
