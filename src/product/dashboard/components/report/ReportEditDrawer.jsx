import GroupSection from "./GroupSection";
import FilterSection from "./FilterSection";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";

import { Spinner } from "@/shared/components/ui/spinner";
import { useReportBuilder } from "../../context/ReportBuilderContext";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

const ReportEditDrawer = ({
  isOpen,
  onClose,
  columns,
  rowGroups,
  columnGroups,
  filters,
  onApply,
  isGenerating,
}) => {
  const { state, actions } = useReportBuilder();

  const activeTab = state.ui.activeTab;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      direction="right"
    >
      <DrawerContent className="h-full max-h-full w-full sm:max-w-md">
        {/* Header */}
        <DrawerHeader className="border-b px-4 py-3">
          <DrawerTitle>Report Configuration</DrawerTitle>

          <DrawerDescription>
            Configure the columns, groups, and filters for your report.
          </DrawerDescription>

          <Tabs
            value={state.ui.activeTab}
            onValueChange={actions.setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="columns">Columns</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>
          </Tabs>
        </DrawerHeader>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {activeTab === "columns" && (
            <div className="space-y-4">
              <GroupSection title="Columns" groups={columns} type="columns" />

              <GroupSection
                title="Row Groups"
                groups={rowGroups}
                type="rowGroups"
              />

              <GroupSection
                title="Column Groups"
                groups={columnGroups}
                type="columnGroups"
              />
            </div>
          )}

          {activeTab === "filters" && <FilterSection filters={filters} />}
        </div>

        {/* Footer */}
        <DrawerFooter className="border-t bg-background px-4 py-3">
          <Button type="button" disabled={isGenerating} onClick={onApply}>
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                Applying
              </span>
            ) : (
              "Apply"
            )}
          </Button>

          <DrawerClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ReportEditDrawer;
