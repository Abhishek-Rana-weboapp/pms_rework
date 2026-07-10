import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Tailwind class map for priority pills (soft background + readable text).
 * Used as a className: `getStatusColors[priority]`.
 */
export const getStatusColors = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
  Critical: "bg-red-100 text-red-700",
};

/**
 * Background colors for project-status pills, keyed by status name.
 * Used as an inline style so dynamic/uppercase API values are easy to map.
 */
export const colorsObject = {
  "TO DO": "#E5E7EB",
  "IN PROGRESS": "#DBEAFE",
  "IN REVIEW": "#EDE9FE",
  "ON HOLD": "#FEF3C7",
  DONE: "#DCFCE7",
  COMPLETED: "#DCFCE7",
  CANCELLED: "#FEE2E2",
};

/** Matching text colors for the status pills above. */
export const textColorsObject = {
  "TO DO": "#374151",
  "IN PROGRESS": "#1D4ED8",
  "IN REVIEW": "#6D28D9",
  "ON HOLD": "#B45309",
  DONE: "#15803D",
  COMPLETED: "#15803D",
  CANCELLED: "#B91C1C",
};