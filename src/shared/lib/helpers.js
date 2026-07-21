import { format } from "date-fns";

export const createFullName = (obj)=>{
    const firstName = obj?.first_name || "";
    const lastName = obj?.last_name || "";

    return `${firstName} ${lastName}`.trim()
}


export const createInitials = (obj)=>{
    const firstName = obj?.first_name || "";
    const lastName = obj?.last_name || "";

    return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()
}

export const createInitialsFromSingleName = (name)=>{
  const [firstName, lastName] = name.split(" ");

  if(!firstName) return "NA";

  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()
}


// Uppercases the first letter of a string, leaving the rest untouched.
export const capitalizeFirst = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;


export function formatDateLocal(dateString) {
   if(!dateString) return "NA";
  const date = new Date(dateString);

  const options = {
    month: "short", // Mar
    day: "2-digit", // 25
    year: "numeric", // 2024
  };

  return date.toLocaleDateString("en-US", options);
}


// Serialize a Date for API payloads (YYYY-MM-DD); empty input -> null.
// Forms hold real Date objects and convert at the submit boundary — use this
// anywhere a request body/query param needs a date string.
export const toApiDate = (date) => (date ? format(date, "yyyy-MM-dd") : null);


// True when both dates fall on the same calendar day (local time).
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Human date heading for a given day: "Today" / "Yesterday", else "Mar 25, 2024".
export const dateHeading = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return formatDateLocal(dateStr);
};

// Group an ordered list of logs by their day heading, preserving order. Each log
// is bucketed by `dateHeading(log.created_at)`.
export const groupLogsByDate = (logs) =>
  logs.reduce((groups, log) => {
    const key = dateHeading(log.created_at);
    (groups[key] ??= []).push(log);
    return groups;
  }, {});