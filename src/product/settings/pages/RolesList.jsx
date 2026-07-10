import React, { useState } from "react";
import { useRolesTree } from "../api/rolesQueries";
import Wrapper from "@/shared/components/wrappers/Wrapper";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Info, Plus } from "lucide-react";
import RoleTree from "../components/RoleTree";
import RoleForm from "../components/RoleForm";
import { collectRoleIds } from "../config.js/roleTree.utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useNavigate } from "react-router-dom";

// Flatten the role tree into { value, label } options for the "Reports To" select.
const buildReportOptions = (roles = []) => {
  const options = [];
  const walk = (nodes) => {
    nodes.forEach((n) => {
      options.push({ value: n.id, label: n.role_name });
      if (Array.isArray(n.children) && n.children.length) walk(n.children);
    });
  };
  walk(roles);
  return options;
};

const RolesList = () => {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  // The role being edited; null means the dialog is in "create" mode.
  const [editingRole, setEditingRole] = useState(null);
  const { data: list } = useRolesTree();

  const roles = React.useMemo(() => list ?? [], [list]);
  const allIds = React.useMemo(() => collectRoleIds(roles), [roles]);
  const reportOptions = React.useMemo(() => buildReportOptions(roles), [roles]);
  const [collapsed, setCollapsed] = React.useState(() => new Set());

  const expanded = React.useMemo(
    () => new Set(allIds.filter((id) => !collapsed.has(id))),
    [allIds, collapsed],
  );

  const toggle = (id) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allExpanded = collapsed.size === 0;
  const toggleAll = () =>
    setCollapsed(allExpanded ? new Set(allIds) : new Set());

  const openCreate = () => {
    setEditingRole(null);
    setFormOpen(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setFormOpen(true);
  };

  const isEdit = Boolean(editingRole);

  return (
    <>
      <Wrapper className={"space-y-4"}>
        <header className="flex justify-between items-center bg-white shadow p-4 rounded-md">
          <div>
            <h1 className="text-lg font-semibold">Roles</h1>
            <p className="text-gray-500 sm:text-sm text-xs">
              Manage and assign roles to your team members.
            </p>
          </div>

          <Button
            className={"flex sm:text-base text-xs items-center gap-2"}
            onClick={openCreate}
          >
            <Plus /> Create Role
          </Button>
        </header>

        <div className="mt-5 bg-primary/5 text-primary/80 p-2 sm:text-sm text-xs rounded-lg px-3 flex items-center gap-3">
          <Info />
          This page allows you to specify how you share data among users based
          on your organization’s role hierarchy.
        </div>

        <div className="flex justify-between items-center ">
          <Button variant="link" onClick={toggleAll} disabled={!allIds.length}>
            {allExpanded ? "Collapse All" : "Expand All"}
          </Button>
          <span className="text-sm text-gray-700">
            {allIds.length} {allIds.length === 1 ? "role" : "roles"}
          </span>
        </div>

        <div className="bg-white rounded-md shadow p-4">
          {roles.length ? (
            <RoleTree
              roles={roles}
              expanded={expanded}
              onToggle={toggle}
              onEdit={openEdit}
            />
          ) : (
            <p className="text-sm text-gray-500 py-6 text-center">No roles</p>
          )}
        </div>
      </Wrapper>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Role" : "Create Role"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this role’s details and hierarchy."
                : "Add a new role and place it in your organization’s hierarchy."}
            </DialogDescription>
          </DialogHeader>

          <RoleForm
            key={editingRole?.id ?? "create"}
            mode={isEdit ? "edit" : "create"}
            role={editingRole}
            reportOptions={reportOptions}
            onCancel={() => setFormOpen(false)}
            onSuccess={() => setFormOpen(false)}
            onError={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RolesList;
