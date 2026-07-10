import { cn } from "@/shared/lib/utils";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

const FloatingInput = forwardRef(
  (
    {
      label,
      error,
      className,
      inputClassName,
      type = "text",
      id,
      value = "",
      onFocus,
      onBlur,
      onChange,
      shouldFocus=false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    const [focused, setFocused] = useState(false);
    const [isFilled, setIsFilled] = useState(
      String(value ?? "").length > 0
    );

    const inputRef = useRef(null);

    const setRefs = useCallback(
      (el) => {
        inputRef.current = el;

        if (typeof ref === "function") {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      },
      [ref]
    );

    useEffect(()=>{
        if(shouldFocus){
           inputRef.current.focus()
        }
    },[shouldFocus])

    // Controlled value updates (RHF Controller)
    useEffect(() => {
      setIsFilled(String(value ?? "").length > 0);
    }, [value]);

    // Chrome autofill detection
    useEffect(() => {
      const input = inputRef.current;

      if (!input) return;

      const syncAutofill = () => {
        try {
          if (input.matches(":-webkit-autofill")) {
            setIsFilled(true);
          }
        } catch {
          // ignore unsupported selector errors
        }
      };

      syncAutofill();

      const raf = requestAnimationFrame(syncAutofill);

      return () => cancelAnimationFrame(raf);
    }, []);

    const shouldFloat =
      focused ||
      isFilled ||
      String(value ?? "").length > 0;

    return (
      <div className={cn("w-full", className)}>
        <div className="relative w-full">
          <input
            ref={setRefs}
            id={inputId}
            type={type}
            value={value}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => {
              setIsFilled(e.target.value.length > 0);
              onChange?.(e);
            }}
            onAnimationStart={(e) => {
              if (e.animationName === "onAutoFillStart") {
                setIsFilled(true);
              }

              if (e.animationName === "onAutoFillCancel") {
                setIsFilled(e.target.value.length > 0);
              }
            }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "relative w-full rounded-lg border-0 bg-transparent px-4 py-4",
              "outline-none",
              "disabled:cursor-not-allowed disabled:bg-gray-100",
              inputClassName
            )}
            {...props}
          />

          <fieldset
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 rounded-lg border px-2",
              "transition-colors duration-200",
              error
                ? "border-red-500"
                : focused
                ? "border-blue-600"
                : "border-gray-300"
            )}
          >
            <legend
              className={cn(
                "ml-1 h-0 overflow-hidden p-0 text-xs",
                "transition-all duration-200 ease-in-out",
                shouldFloat ? "max-w-full" : "max-w-0"
              )}
            >
              <span className="px-1 opacity-0">{label}</span>
            </legend>
          </fieldset>

          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute left-3 px-1",
              "transition-all duration-200 ease-in-out",
              shouldFloat
                ? "top-0 -translate-y-1/2 text-xs"
                : "top-1/2 -translate-y-1/2",
              error
                ? "text-red-500"
                : focused
                ? "text-blue-600"
                : "text-gray-500"
            )}
          >
            {label}
          </label>
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1 text-sm text-red-500"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;

// import { cn } from "@/shared/lib/utils";
// import {
//   forwardRef,
//   useCallback,
//   useEffect,
//   useId,
//   useRef,
//   useState,
// } from "react";

// const FloatingInput = forwardRef(
//   (
//     {
//       label,
//       error,
//       className,
//       inputClassName,
//       type = "text",
//       id,
//       value,
//       defaultValue,
//       onFocus,
//       onBlur,
//       onChange,
//       ...props
//     },
//     ref
//   ) => {
//     const generatedId = useId();
//     const inputId = id || generatedId;
//     const errorId = `${inputId}-error`;

//     const [focused, setFocused] = useState(false);
//     const [hasValue, setHasValue] = useState(
//       value !== undefined
//         ? String(value).length > 0
//         : String(defaultValue ?? "").length > 0
//     );

//     // Merge the forwarded ref with an internal one so we can read the DOM value
//     // for uncontrolled inputs (react-hook-form, prefilled defaultValues).
//     const innerRef = useRef(null);
//     const setRefs = useCallback(
//       (el) => {
//         innerRef.current = el;
//         if (typeof ref === "function") ref(el);
//         else if (ref) ref.current = el;
//       },
//       [ref]
//     );

//     // After mount, sync with whatever value RHF / the browser put in the field.
//     useEffect(() => {
//       if (innerRef.current) setHasValue(innerRef.current.value.length > 0);
//     }, []);

//     const shouldFloat = focused || hasValue;

//     return (
//       <div className={cn("w-full", className)}>
//         <div className="relative w-full">
//           <input
//             ref={setRefs}
//             id={inputId}
//             type={type}
//             value={value}
//             defaultValue={defaultValue}
//             aria-invalid={!!error}
//             aria-describedby={error ? errorId : undefined}
//             onChange={(e) => {
//               setHasValue(e.target.value.length > 0);
//               onChange?.(e);
//             }}
//             onAnimationStart={(e) => {
//               // Chrome autofill fires this before any onChange (see index.css).
//               if (e.animationName === "onAutoFillStart") setHasValue(true);
//               else if (e.animationName === "onAutoFillCancel")
//                 setHasValue(e.target.value.length > 0);
//             }}
//             onFocus={(e) => {
//               setFocused(true);
//               onFocus?.(e);
//             }}
//             onBlur={(e) => {
//               setFocused(false);
//               onBlur?.(e);
//             }}
//             className={cn(
//               "relative w-full rounded-lg border-0 bg-transparent px-4 py-4",
//               "outline-none",
//               "disabled:cursor-not-allowed disabled:bg-gray-100",
//               inputClassName
//             )}
//             {...props}
//           />

//           {/* Notched outline. The visible border lives here, and the native
//               <legend> punches a real gap in the top border — so it works on any
//               background, with no bg-color masking the border. */}
//           <fieldset
//             aria-hidden="true"
//             className={cn(
//               "pointer-events-none absolute inset-0 rounded-lg border px-2",
//               "transition-colors duration-200",
//               error
//                 ? "border-red-500"
//                 : focused
//                 ? "border-blue-600"
//                 : "border-gray-300"
//             )}
//           >
//             <legend
//               className={cn(
//                 "ml-1 h-0 overflow-hidden p-0 text-xs",
//                 "transition-all duration-200 ease-in-out",
//                 shouldFloat ? "max-w-full" : "max-w-0"
//               )}
//             >
//               {/* Invisible — only reserves the width of the notch. */}
//               <span className="px-1 opacity-0">{label}</span>
//             </legend>
//           </fieldset>

//           <label
//             htmlFor={inputId}
//             className={cn(
//               "pointer-events-none absolute left-3 px-1",
//               "transition-all duration-200 ease-in-out",
//               shouldFloat
//                 ? "top-0 -translate-y-1/2 text-xs"
//                 : "top-1/2 -translate-y-1/2 ",
//               error
//                 ? "text-red-500"
//                 : focused
//                 ? "text-blue-600"
//                 : "text-gray-500"
//             )}
//           >
//             {label}
//           </label>
//         </div>

//         {error && (
//           <p
//             id={errorId}
//             role="alert"
//             className="mt-1 text-sm text-red-500"
//           >
//             {error}
//           </p>
//         )}
//       </div>
//     );
//   }
// );

// FloatingInput.displayName = "FloatingInput";

// export default FloatingInput;
