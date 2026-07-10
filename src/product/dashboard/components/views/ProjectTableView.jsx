import { useMemo } from "react";

import DataTable from "@/shared/components/data-table/DataTable";
import { getProjectColumns } from "@/shared/components/data-table/columns/ProjectColumns";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { createFullName, createInitials } from "@/shared/lib/helpers";
import {
  colorsObject,
  getStatusColors,
  textColorsObject,
} from "@/shared/lib/utils";

/** Small wrapper so columns can render `<Avatar small user={...} />`. */
const UserAvatar = ({ user, small }) => (
  <Avatar size={small ? "sm" : "default"}>
    <AvatarImage src={user?.user_image} alt={createFullName(user)} />
    <AvatarFallback>{createInitials(user) || "?"}</AvatarFallback>
  </Avatar>
);

const ProjectTableView = ({ projects = [], isLoading = false, onRowClick }) => {
  const columns = useMemo(
    () =>
      getProjectColumns({
        getStatusColors,
        colorsObject,
        textColorsObject,
        Avatar: UserAvatar,
        getFullNames: createFullName,
      }),
    []
  );

  return (
    <DataTable
      columns={columns}
      data={projects}
      isLoading={isLoading}
      onRowClick={onRowClick}
      searchPlaceholder="Search projects..."
      emptyMessage="No projects found."
      className="[&_td]:py-4"
      // The list is paginated server-side by <ProjectList>, so the table should
      // render the current page as-is rather than paginate it again client-side.
      enablePagination={false}
    />
  );
};

export default ProjectTableView;
