import { useEffect, useState } from "react";

// Returns `value` only after it has stopped changing for `delay` ms. Lets an
// input stay fully controlled (and instant to type in) while whatever the value
// feeds — a query key, a filter — settles first.
export const useDebouncedValue = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
