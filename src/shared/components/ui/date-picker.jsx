import * as React from "react";
import { format, parse, isValid, startOfDay, isEqual } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

/**
 * Controlled date picker with a typeable input + calendar popover.
 *
 * Props:
 *  - value: Date | undefined      committed value
 *  - onChange: (Date|undefined)   called when a valid date is picked/typed, or cleared
 *  - dateFormat: string           date-fns format for display + parsing (default "dd-MM-yyyy")
 *  - placeholder, id, name, disabled
 *  - calendarProps                extra props forwarded to <Calendar/> (e.g. `disabled` ranges)
 *  - onBlur                       forwarded (useful for RHF field.onBlur)
 *
 * As the user types, digits are auto-masked into the `dateFormat` shape — the
 * separator (e.g. "-") is inserted automatically between day/month/year.
 *
 * ref is forwarded to the underlying <input> so RHF/Controller can attach it.
 */
const DatePicker = React.forwardRef(function DatePicker(
  {
    value,
    onChange,
    dateFormat = "dd-MM-yyyy",
    placeholder,
    id,
    name,
    disabled,
    className,
    calendarProps,
    onBlur,
    ...props
  },
  ref
) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    value && isValid(value) ? format(value, dateFormat) : ""
  );
  // Calendar's visible month; follows the committed/typed value.
  const [month, setMonth] = React.useState(
    value && isValid(value) ? value : undefined
  );

  // Own the DOM input so we can restore the caret after masking, while still
  // exposing that same element to any forwarded ref (RHF's field.ref, etc.).
  const innerRef = React.useRef(null);
  React.useImperativeHandle(ref, () => innerRef.current, []);
  // Caret position to apply after the next masked re-render (null = leave alone).
  const caretRef = React.useRef(null);
  // The popover content, so ArrowDown from the input can hand focus to the
  // calendar grid — react-day-picker owns arrow navigation once a day is focused.
  const contentRef = React.useRef(null);

  const focusCalendar = React.useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    // Focusing rdp's focus-target day (tabindex 0) fires its onFocus, which sets
    // react-day-picker's internal focused day so the arrow keys start navigating.
    const day =
      content.querySelector('button[data-day][tabindex="0"]') ||
      content.querySelector('button[data-day][aria-selected="true"]') ||
      content.querySelector("button[data-day]:not([disabled])");
    day?.focus();
  }, []);

  // Whenever the calendar opens (icon click, ArrowDown, etc.), move focus into
  // the day grid so the arrow keys work immediately. rAF waits for the portal
  // content + react-day-picker's own focus effects to settle first.
  React.useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(focusCalendar)
    );
    return () => cancelAnimationFrame(raf);
  }, [open, focusCalendar]);

  // Derive the separator and per-segment digit lengths from the format so the
  // mask stays in sync if `dateFormat` ever changes (e.g. "dd-MM-yyyy" -> 2/2/4).
  const { sep, segLens, maxDigits } = React.useMemo(() => {
    const s = (dateFormat.match(/[^a-zA-Z0-9]/) || ["-"])[0];
    const lens = dateFormat.split(s).map((p) => p.length);
    return { sep: s, segLens: lens, maxDigits: lens.reduce((a, b) => a + b, 0) };
  }, [dateFormat]);

  // Turn a run of digits into the separated display shape. Never emits a
  // trailing separator, so backspacing a separator deletes the digit next to it
  // instead of leaving the caret stuck against a re-inserted separator.
  const maskDigits = React.useCallback(
    (digits) => {
      let out = "";
      let idx = 0;
      for (let i = 0; i < segLens.length; i++) {
        const seg = digits.slice(idx, idx + segLens[i]);
        if (!seg) break;
        out += (i > 0 ? sep : "") + seg;
        idx += segLens[i];
      }
      return out;
    },
    [segLens, sep]
  );

  // Where the caret should sit so that `digitsLeft` digits are to its left.
  const caretForDigits = React.useCallback((masked, digitsLeft) => {
    if (digitsLeft <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < masked.length; i++) {
      if (/\d/.test(masked[i])) {
        seen += 1;
        if (seen === digitsLeft) return i + 1;
      }
    }
    return masked.length;
  }, []);

  // Parse the current text against the expected format. We also require a
  // round-trip (re-formatting the parsed date equals the input) so impossible
  // dates like 31-02 or partial junk are rejected instead of silently rolling over.
  const parseInput = React.useCallback(
    (text) => {
      const parsed = parse(text, dateFormat, new Date());
      if (!isValid(parsed) || format(parsed, dateFormat) !== text) return null;
      return parsed;
    },
    [dateFormat]
  );

  // Keep the text in sync when `value` changes from the OUTSIDE (calendar click,
  // form reset, edit-mode prefill) — but never clobber what the user is typing.
  React.useEffect(() => {
    const typed = parseInput(inputValue);
    const inSync =
      value && typed && isEqual(startOfDay(typed), startOfDay(value));
    if (inSync) return; // text already represents the value; leave the caret alone
    setInputValue(value && isValid(value) ? format(value, dateFormat) : "");
    if (value && isValid(value)) setMonth(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, dateFormat]);

  // Restore the caret after a masked re-render so auto-inserted separators don't
  // bounce the cursor to the end while editing in the middle of the field.
  React.useLayoutEffect(() => {
    if (caretRef.current != null && innerRef.current) {
      innerRef.current.setSelectionRange(caretRef.current, caretRef.current);
      caretRef.current = null;
    }
  });

  const handleInputChange = (e) => {
    const el = e.target;
    const raw = el.value;
    const caret = el.selectionStart ?? raw.length;

    // Count digits left of the caret so we can put it back in the right spot
    // once separators shift the string around.
    const digitsLeft = raw.slice(0, caret).replace(/\D/g, "").length;
    const digits = raw.replace(/\D/g, "").slice(0, maxDigits);
    const masked = maskDigits(digits);

    caretRef.current = caretForDigits(masked, digitsLeft);
    setInputValue(masked);

    if (masked === "") {
      onChange?.(undefined);
      return;
    }
    const parsed = parseInput(masked);
    if (parsed) {
      setMonth(parsed);
      onChange?.(parsed); // commit only complete, valid dates
    }
  };

  // On blur, canonicalize valid text or discard invalid text (revert to value).
  const handleBlur = (e) => {
    if (inputValue === "") {
      onChange?.(undefined);
    } else {
      const parsed = parseInput(inputValue);
      if (parsed) {
        setInputValue(format(parsed, dateFormat));
      } else {
        setInputValue(value && isValid(value) ? format(value, dateFormat) : "");
      }
    }
    onBlur?.(e);
  };

  const handleSelect = (date) => {
    if (date) {
      setInputValue(format(date, dateFormat));
      setMonth(date);
    }
    onChange?.(date ?? undefined);
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={innerRef}
        id={id}
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        inputMode="numeric"
        onKeyDown={(e) => {
          // ArrowDown opens the calendar; the open-effect moves focus into the
          // day grid so the arrow keys navigate days (Enter/Space picks one).
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (open) focusCalendar();
            else setOpen(true);
          }
        }}
        placeholder={placeholder ?? dateFormat.toLowerCase()}
        disabled={disabled}
        className="pr-10"
        aria-invalid={inputValue !== "" && !parseInput(inputValue) ? true : undefined}
        {...props}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label="Open calendar"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground"
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="center"
          // Keep Radix from focusing the nav buttons; we focus a day ourselves.
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Wrapper div gives a reliable DOM handle to the calendar so we can
              locate + focus a day (independent of PopoverContent ref forwarding). */}
          <div ref={contentRef}>
            <Calendar
              mode="single"
              autoFocus
              // Dropdowns for month + year so users can jump directly instead of
              // clicking the nav arrows month by month.
              captionLayout="dropdown"
              startMonth={new Date(1970, 0)}
              endMonth={new Date(new Date().getFullYear() + 10, 11)}
              selected={value && isValid(value) ? value : undefined}
              month={month}
              onMonthChange={setMonth}
              onSelect={handleSelect}
              {...calendarProps}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

export { DatePicker };
