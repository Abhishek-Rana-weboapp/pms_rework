import { useState } from "react";

import PermissionGate from "@/product/auth/components/PermissionGate";
import { PERMISSIONS } from "@/product/auth/config/permissions";
import { useAuthPermissions } from "@/product/auth/hooks/useAuthPermissions";
import DataTable from "@/shared/components/data-table/DataTable";
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
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import Wrapper from "@/shared/components/wrappers/Wrapper";
import {
  useGlobalStatus,
  usePriorities,
  useProjectTypes,
} from "../api/settingsQueries";
import PriorityForm from "../components/PriorityForm";
import ProjectTypeForm from "../components/ProjectTypeForm";
import StatusForm from "../components/StatusForm";

const MetaData = () => {
  const { can } = useAuthPermissions();
  const [activeTab, setActiveTab] = useState("priority");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: priorities = [] } = usePriorities();
  const { data: projectTypes = [] } = useProjectTypes();
  const { data: statuses = [] } = useGlobalStatus();

  const editMetaData = (item) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  // Single source of truth per tab. Columns are built with that tab's
  // edit/delete permission flags so the actions menu stays in sync.
  const TABS = {
    priority: {
      label: "Priority",
      data: priorities,
      Form: PriorityForm,
      getColumns: getPriorityColumns,
      createPermission: PERMISSIONS.PRIORITY.ADD,
      editPermission: PERMISSIONS.PRIORITY.CHANGE,
      deletePermission: PERMISSIONS.PRIORITY.DELETE,
    },
    status: {
      label: "Status",
      data: statuses,
      Form: StatusForm,
      getColumns: getStatusColumns,
      createPermission: PERMISSIONS.ORGANIZATION_STATUS_TEMPLATE.ADD,
      editPermission: PERMISSIONS.ORGANIZATION_STATUS_TEMPLATE.CHANGE,
      deletePermission: PERMISSIONS.ORGANIZATION_STATUS_TEMPLATE.DELETE,
    },
    "project-type": {
      label: "Project type",
      data: projectTypes,
      Form: ProjectTypeForm,
      getColumns: getProjectTypeColumns,
      createPermission: PERMISSIONS.PROJECT_TYPE.ADD,
      editPermission: PERMISSIONS.PROJECT_TYPE.CHANGE,
      deletePermission: PERMISSIONS.PROJECT_TYPE.DELETE,
    },
  };

  const current = TABS[activeTab];
  const CurrentForm = current.Form;

  // React Compiler keeps this stable when deps don't change.
  const columns = current.getColumns({
    onEdit: editMetaData,
    onDelete: () => {},
    canEdit: can(current.editPermission),
    canDelete: can(current.deletePermission),
  });

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
              <PermissionGate permission={current.createPermission}>
                <Button onClick={() => setSelectedItem(null)}>
                  Create {current.label}
                </Button>
              </PermissionGate>
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
          columns={columns}
          data={current.data}
          enablePagination={false}
        />
      </div>
    </Wrapper>
  );
};

export default MetaData;
