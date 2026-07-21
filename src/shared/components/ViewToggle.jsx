import { LayoutGrid, List } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

// Table/grid switcher shared by every list page. Controlled — `value` is
// "table" | "grid". Relies on the app-level TooltipProvider (mounted in the
// dashboard layout) for the hover labels.
const OPTIONS = [
  { value: "table", label: "Table view", Icon: List },
  { value: "grid", label: "Grid view", Icon: LayoutGrid },
];

const ViewToggle = ({ value, onValueChange, className }) => (
  <Tabs value={value} onValueChange={onValueChange} className={className}>
    <TabsList>
      {OPTIONS.map(({ value: optionValue, label, Icon }) => (
        // Tooltip is nested INSIDE the trigger, not wrapped around it: wrapping
        // makes Radix Tooltip and Tabs both write data-state onto the same node,
        // and the tooltip's state clobbers the tab's active state (no white bg).
        <TabsTrigger key={optionValue} value={optionValue} aria-label={label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center justify-center">
                <Icon />
              </span>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

export default ViewToggle;
