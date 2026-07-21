import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building } from "lucide-react";

import { useBranches } from "../api/settingsQueries";
import { Button } from "@/shared/components/ui/button";
import DataTable from "@/shared/components/data-table/DataTable";
import { getBranchTableColumns } from "@/shared/components/data-table/columns/BranchColumns";
import BranchForm from "./BranchForm";

const BranchSection = ({ org, orgId }) => {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const { data: branchesData = [], isLoading } = useBranches();

  const openAdd = () => {
    setSelectedBranch(null);
    setFormOpen(true);
  };

  const openEdit = (branch) => {
    setSelectedBranch(branch);
    setFormOpen(true);
  };

  const columns = useMemo(
    () => getBranchTableColumns({ onEdit: openEdit }),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <Building className="size-5 text-primary" /> Company Branches
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage branches across all companies.
          </p>
        </div>

        <Button onClick={openAdd}>Add Branch</Button>
      </div>

      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={branchesData}
        searchPlaceholder="Search branches..."
        emptyMessage="No branches yet. Add your first branch to get started."
        onRowClick={(branch) =>
          navigate(
            `/${orgId}/profile-settings/company-settings/branch/${branch.id}`,
            { state: { tab: "branch" } },
          )
        }
      />

      <BranchForm
        open={formOpen}
        onOpenChange={setFormOpen}
        selectedBranch={selectedBranch}
        companySettingsId={org?.id ?? orgId}
      />
    </div>
  );
};

export default BranchSection;
