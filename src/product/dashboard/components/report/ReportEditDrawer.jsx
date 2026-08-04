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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import PageLoader from "@/shared/components/layout/PageLoader";

const ReportEditDrawer = ({
  isOpen,
  onClose,
  onApply,
  isGenerating,
  isLoadingConfiguration = false,
}) => {
  const { state, actions } = useReportBuilder();

  const {
    columns = [],
    rowGroups = [],
    columnGroups = [],
    filters = [],
  } = state.configuration;

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
        <Tabs
          value={state.ui.activeTab}
          onValueChange={actions.setActiveTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DrawerHeader className="space-y-3 border-b px-4 py-3">
            <div>
              <DrawerTitle>Report Configuration</DrawerTitle>
              <DrawerDescription>
                Configure the columns, groups, and filters for your report.
              </DrawerDescription>
            </div>

            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="columns">Columns</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {isLoadingConfiguration ? (
              <PageLoader />
            ) : (
              <>
                <TabsContent value="columns" className="mt-0 space-y-4">
                  <GroupSection
                    title="Columns"
                    groups={columns}
                    type="columns"
                  />

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
                </TabsContent>

                <TabsContent value="filters" className="mt-0">
                  <FilterSection filters={filters} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>

        <DrawerFooter className="border-t bg-background px-4 py-3">
          <Button
            type="button"
            disabled={isGenerating || isLoadingConfiguration}
            onClick={onApply}
          >
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
