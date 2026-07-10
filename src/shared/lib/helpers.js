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


// Uppercases the first letter of a string, leaving the rest untouched.
export const capitalizeFirst = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;


export function formatDateLocal(dateString) {
  const date = new Date(dateString);

  const options = {
    month: "short", // Mar
    day: "2-digit", // 25
    year: "numeric", // 2024
  };

  return date.toLocaleDateString("en-US", options);
}