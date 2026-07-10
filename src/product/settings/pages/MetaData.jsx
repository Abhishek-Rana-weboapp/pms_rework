import DataTable from "@/shared/components/data-table/DataTable";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import Wrapper from "@/shared/components/wrappers/Wrapper";
import { useState } from "react";
import {
  useGlobalStatus,
  usePriorities,
  useProjectTypes,
} from "../api/settingsQueries";
import {
  getPriorityColumns,
  getProjectTypeColumns,
  getStatusColumns,
} from "@/shared/components/data-table/columns/MetaDataColumns";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import PriorityForm from "../components/PriorityForm";
import ProjectTypeForm from "../components/ProjectTypeForm";
import StatusForm from "../components/StatusForm";

const MetaData = () => {
  const [activeTab, setActiveTab] = useState("priority");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const {
    data: priorities=[],
    isLoading: isPrioritiesLoading,
    error: priorityError,
  } = usePriorities();
  const {
    data: projectTypes=[],
    isLoading: isProjestTypesLoading,
    error: projectTypeError,
  } = useProjectTypes();
  const {
    data: statuses=[],
    isLoading: isstatuesesLoading,
    error: statusesError,
  } = useGlobalStatus();

  const editMetaData = (selectedItem) => {
    setSelectedItem(selectedItem);
    setIsOpen(true);
    return;
  };

  // The React Compiler stabilises these column references across renders, so
  // TanStack still gets a stable `columns` prop (avoids visibility/sort desync).
  const priorityColumns = getPriorityColumns({
    onEdit: editMetaData,
    onDelete: () => {},
  });
  const statusColumns = getStatusColumns({
    onEdit: editMetaData,
    onDelete: () => {},
  });
  const projectTypeColumns = getProjectTypeColumns({
    onEdit: editMetaData,
    onDelete: () => {},
  });

  // Single source of truth per tab: its label, data, columns and form component.
  // Adding a new metadata tab means adding one entry here — nothing else changes.
  const TABS = {
    priority: {
      label: "Priority",
      data: priorities,
      columns: priorityColumns,
      Form: PriorityForm,
    },
    status: {
      label: "Status",
      data: statuses,
      columns: statusColumns,
      Form: StatusForm,
    },
    "project-type": {
      label: "Project type",
      data: projectTypes,
      columns: projectTypeColumns,
      Form: ProjectTypeForm,
    },
  };

  const current = TABS[activeTab];
  const CurrentForm = current.Form;

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedItem(null);
  };

  return (
    <Wrapper>
      <div className="p-4 rounded-md shadow bg-white">
        <h1 className="text-lg font-semibold">Meta Data</h1>
        <p className="text-sm text-gray-500 ">
          Manage priorities, project types and statuses
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={"bg-gray-200"}>
            {Object.entries(TABS).map(([value, { label }]) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div>
          <Dialog
            open={isOpen}
            onOpenChange={(open) => (open ? setIsOpen(true) : closeDialog())}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedItem(null)}>
                Create {current.label}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedItem ? "Update" : "Create"} {current.label}
                </DialogTitle>
              </DialogHeader>
              <div>
                <CurrentForm
                  selectedItem={selectedItem}
                  onSuccess={closeDialog}
                  onCancel={closeDialog}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white p-4 mt-5 shadow rounded-md">
        <DataTable
          columns={current.columns}
          data={current.data}
          enablePagination={false}
        />
      </div>
    </Wrapper>
  );
};

export default MetaData;
