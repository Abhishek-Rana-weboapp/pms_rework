import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const CLAMP_CLASS = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

const ShowMore = ({
  children,
  lines = 3,
  maxExpandedHeight = 320,
  containerClassName,
  contentClassName,
}) => {
  const contentRef = useRef(null);

  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(true);
  const [showToggle, setShowToggle] = useState(false);

  const [collapsedHeight, setCollapsedHeight] = useState(null);
  const [expandedHeight, setExpandedHeight] = useState(null);

  const measureHeights = useCallback(() => {
    const el = contentRef.current;

    if (!el) return;

    const previousClamp = clamped;

    // Measure collapsed height
    el.classList.add(CLAMP_CLASS[lines] ?? CLAMP_CLASS[3]);
    const collapsed = el.clientHeight;

    // Measure natural height
    el.classList.remove(CLAMP_CLASS[lines] ?? CLAMP_CLASS[3]);
    const natural = el.scrollHeight;

    // Restore current visual state
    if (previousClamp) {
      el.classList.add(CLAMP_CLASS[lines] ?? CLAMP_CLASS[3]);
    }

    setCollapsedHeight(collapsed);
    setExpandedHeight(Math.min(natural, maxExpandedHeight));
    setShowToggle(natural > collapsed);
  }, [clamped, lines, maxExpandedHeight]);

  useLayoutEffect(() => {
    measureHeights();
  }, [measureHeights, children]);

  useLayoutEffect(() => {
    const el = contentRef.current;

    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      measureHeights();
    });

    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [measureHeights]);

  const handleToggle = () => {
    if (expanded && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    if (!expanded) {
      setClamped(false);
    }

    setExpanded((prev) => !prev);
  };

  const handleAnimationComplete = () => {
    if (!expanded) {
      setClamped(true);
    }
  };

  const expandedStyles = expanded
    ? {
        maxHeight: maxExpandedHeight,
        overflowY: "auto",
      }
    : undefined;

  if (collapsedHeight === null || expandedHeight === null) {
    return (
      <div
        className={cn(
          "bg-gray-100 rounded-md p-4",
          containerClassName
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            "wrap-break-word whitespace-pre-wrap scrollbar-thin text-sm",
            CLAMP_CLASS[lines] ?? CLAMP_CLASS[3],
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-gray-100 rounded-md p-4",
        containerClassName
      )}
    >
      <motion.div
        initial={false}
        animate={{
          height: expanded ? expandedHeight : collapsedHeight,
        }}
        transition={{
          duration: 0.35,
          ease: [0.4, 0, 0.2, 1],
        }}
        onAnimationComplete={handleAnimationComplete}
        style={{ overflow: "hidden" }}
      >
        <div
          ref={contentRef}
          style={expandedStyles}
          className={cn(
            "wrap-break-word whitespace-pre-wrap scrollbar-thin text-sm",
            clamped &&
              (CLAMP_CLASS[lines] ?? CLAMP_CLASS[3]),
            contentClassName
          )}
        >
          {children}
        </div>
      </motion.div>

      {showToggle && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleToggle}
            className="text-blue-600 text-xs mt-1 hover:underline ml-auto cursor-pointer flex items-center gap-1"
          >
            {expanded ? "Show Less" : "Show More"}

            <motion.span
              initial={false}
              animate={{
                rotate: expanded ? 180 : 0,
              }}
              transition={{
                duration: 0.35,
                ease: [0.4, 0, 0.2, 1],
              }}
              style={{ display: "flex" }}
            >
              <ChevronDown size={10} />
            </motion.span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ShowMore;
