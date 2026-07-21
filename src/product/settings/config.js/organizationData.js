// Static option data for the Company Settings (organization) forms.
// Kept out of the components so the option lists are edited in one place.

export const COMPANY_SIZES = ["0-10", "10-20", "20-30", "30-50", "50-100", "100+"];

export const COUNTRIES = ["India", "USA", "UK", "Canada"];

export const TIMEZONES = [
  { value: "IST", label: "IST (India Standard Time UTC+05:30)" },
  { value: "GMT", label: "GMT (Greenwich Mean Time UTC+00:00)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time UTC+00:00)" },
  { value: "EST", label: "EST (Eastern Standard Time UTC-05:00)" },
  { value: "EDT", label: "EDT (Eastern Daylight Time UTC-04:00)" },
  { value: "CST", label: "CST (Central Standard Time UTC-06:00)" },
  { value: "CDT", label: "CDT (Central Daylight Time UTC-05:00)" },
  { value: "PST", label: "PST (Pacific Standard Time UTC-08:00)" },
  { value: "PDT", label: "PDT (Pacific Daylight Time UTC-07:00)" },
  { value: "BST", label: "BST (British Summer Time UTC+01:00)" },
  { value: "CET", label: "CET (Central European Time UTC+01:00)" },
  { value: "CEST", label: "CEST (Central European Summer Time UTC+02:00)" },
  { value: "AEST", label: "AEST (Australian Eastern Standard Time UTC+10:00)" },
  { value: "AEDT", label: "AEDT (Australian Eastern Daylight Time UTC+11:00)" },
  { value: "JST", label: "JST (Japan Standard Time UTC+09:00)" },
  { value: "KST", label: "KST (Korea Standard Time UTC+09:00)" },
  { value: "SGT", label: "SGT (Singapore Time UTC+08:00)" },
];

export const CURRENCIES = [
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
];

export const WORKING_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
