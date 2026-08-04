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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: priorities = [] } = usePriorities();
  const { data: projectTypes = [] } = useProjectTypes();
  const { data: statuses = [] } = useGlobalStatus();

  const TABS = {
    priority: {
      label: "Priority",
      data: priorities,
      Form: PriorityForm,
      getColumns: getPriorityColumns,
      viewPermission: PERMISSIONS.PRIORITY.VIEW,
      createPermission: PERMISSIONS.PRIORITY.ADD,
      editPermission: PERMISSIONS.PRIORITY.CHANGE,
      deletePermission: PERMISSIONS.PRIORITY.DELETE,
    },
    status: {
      label: "Status",
      data: statuses,
      Form: StatusForm,
      getColumns: getStatusColumns,
      viewPermission: PERMISSIONS.ORGANIZATION_STATUS_TEMPLATE.VIEW,
      createPermission: PERMISSIONS.ORGANIZATION_STATUS_TEMPLATE.ADD,
      editPermission: PERMISSIONS.ORGANIZATION_STATUS_TEMPLATE.CHANGE,
      deletePermission: PERMISSIONS.ORGANIZATION_STATUS_TEMPLATE.DELETE,
    },
    "project-type": {
      label: "Project type",
      data: projectTypes,
      Form: ProjectTypeForm,
      getColumns: getProjectTypeColumns,
      viewPermission: PERMISSIONS.PROJECT_TYPE.VIEW,
      createPermission: PERMISSIONS.PROJECT_TYPE.ADD,
      editPermission: PERMISSIONS.PROJECT_TYPE.CHANGE,
      deletePermission: PERMISSIONS.PROJECT_TYPE.DELETE,
    },
  };

  const availableTabKeys = Object.keys(TABS).filter((key) =>
    can(TABS[key].viewPermission),
  );

  const [activeTab, setActiveTab] = useState(availableTabKeys[0] ?? "");

  // Keep selection on a permitted tab (e.g. after permissions resolve / change).
  if (availableTabKeys.length > 0 && !availableTabKeys.includes(activeTab)) {
    setActiveTab(availableTabKeys[0]);
  }

  const editMetaData = (item) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const current = TABS[activeTab];

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedItem(null);
  };

  if (!current) {
    return (
      <Wrapper>
        <div className="rounded-md bg-white p-4 shadow">
          <h1 className="text-lg font-semibold">Meta Data</h1>
          <p className="text-sm text-gray-500">
            You don&apos;t have permission to view any metadata.
          </p>
        </div>
      </Wrapper>
    );
  }

  const CurrentForm = current.Form;
  const columns = current.getColumns({
    onEdit: editMetaData,
    onDelete: () => {},
    editPermission: current.editPermission,
    deletePermission: current.deletePermission,
  });

  return (
    <Wrapper>
      <div className="rounded-md bg-white p-4 shadow">
        <h1 className="text-lg font-semibold">Meta Data</h1>
        <p className="text-sm text-gray-500">
          Manage priorities, project types and statuses
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-200">
            {Object.entries(TABS).map(([value, { label, viewPermission }]) => (
              <PermissionGate key={value} permission={viewPermission}>
                <TabsTrigger value={value}>{label}</TabsTrigger>
              </PermissionGate>
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

      <div className="mt-5 rounded-md bg-white p-4 shadow">
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
