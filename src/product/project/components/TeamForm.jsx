import { useEmployees } from "@/product/dashboard/api/queries";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  // Note: Depending on your exact local shadcn/ui installation, 
  // you might also have ComboboxChips, ComboboxChipList, ComboboxChip
} from "@/shared/components/ui/combobox";
import { createFullName } from "@/shared/lib/helpers";
import { useState } from "react";

const TeamForm = () => {
  const { data } = useEmployees();
  
  // 1. Initialize state as an array for multi-select
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);
  
  const developers = data?.results || [];

  return (
    <div>
      <Combobox  
        multiple 
        items={developers} 
        value={selectedDevelopers}
        // 2. Add handler to update the selection list array
        onValueChange={setSelectedDevelopers}
      >
        {/* Input box for typing search filters */}
        <ComboboxInput placeholder="Search and select developers..." />

        <ComboboxContent>
          <ComboboxEmpty>No Developers available</ComboboxEmpty>
          <ComboboxList>
            {(item) => {
              return (
                <ComboboxItem key={item.id} value={item}>
                  {createFullName(item)}
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {/* Debug view to see your array populating in real-time */}
      <div className="mt-4 text-sm text-muted-foreground">
        Selected: {selectedDevelopers.map(dev => createFullName(dev)).join(", ") || "None"}
      </div>
    </div>
  );
};

export default TeamForm;
