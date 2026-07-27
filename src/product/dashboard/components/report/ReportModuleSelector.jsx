import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { useReportBuilder } from "../../context/ReportBuilderContext";
import { Spinner } from "@/shared/components/ui/spinner";
import { Button } from "@/shared/components/ui/button";

const ReportModuleSelector = ({
  primaryModules,
  associatedModules,
  isLoadingAssociatedModules,
  handleGenerateReport
}) => {
  const { state, actions } = useReportBuilder();

  const { primary, associated } = state.module;

  const primaryOptions = primaryModules ?? [];

  const associatedOptions =
    associatedModules?.map((module) => ({
      value: module,
      label: module,
    })) ?? [];

  const handleMainModuleChange = (value) => {
    actions.setPrimaryModule(value);
  };

  const handleAssociatedModuleChange = (value) => {
    actions.setAssociatedModule(value);
  };



  return (
    <div className="flex w-full items-center gap-2 max-md:flex-col">
      {/* Primary Module */}
      <Select
        value={primary ?? ""}
        onValueChange={handleMainModuleChange}
      >
        <SelectTrigger className="w-1/2 max-md:w-full">
          <SelectValue placeholder="Module" />
        </SelectTrigger>

        <SelectContent position="popper">
          {primaryOptions.map((module) => (
            <SelectItem
              key={module.value}
              value={module.value}
            >
              {module.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Associated Module */}
      <div className="relative w-1/2 max-md:w-full">
        <Select
          value={associated ?? ""}
          onValueChange={handleAssociatedModuleChange}
          disabled={
            !primary || isLoadingAssociatedModules
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Associated Module" />
          </SelectTrigger>

          <SelectContent position="popper">
            {associatedOptions.map((module) => (
              <SelectItem
                key={module.value}
                value={module.value}
              >
                {module.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoadingAssociatedModules && (
          <span className="absolute top-[calc(100%+10px)] flex items-center gap-2 text-xs text-blue-500">
            <Spinner className="size-4" />
            Loading options
          </span>
        )}
      </div>

      <Button onClick={handleGenerateReport}>Generate Report</Button>
    </div>
  );
};

export default ReportModuleSelector;