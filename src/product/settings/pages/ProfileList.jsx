import DataTable from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import Wrapper from "@/shared/components/wrappers/Wrapper";
import { useNavigate, useNavigation } from "react-router-dom";
import { useProfiles } from "../api/settingsQueries";
import { getProfileColumns } from "@/shared/components/data-table/columns/ProfileColumns";
import { useState } from "react";

// Sum assigned-user counts across profiles (supports array or number).
const countUsers = (profiles) =>
  profiles.reduce((total, p) => {
    const users = p?.assigned_users;
    return total + (Array.isArray(users) ? users.length : Number(users) || 0);
  }, 0);

const ProfileList = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const { data: profiles = [], isLoading } = useProfiles();

  const columns = getProfileColumns({
    onEdit: (profile) => navigate(`${profile.id}/edit`),
    onDelete: (profile) => {
      // TODO: wire up delete (confirmation + mutation) for `profile`.
      console.log("delete profile", profile);
    },
  });

  const totalUsers = countUsers(profiles);

  const goToCreate = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    navigate("new");
  };

  return (
    <Wrapper>
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <h1 className="text-xl font-medium">Profiles</h1>
              <p className="text-sm text-gray-500">
                Profiles allow you to assign permissions to different people
              </p>
            </div>
          </div>
          <div>
            <div></div>

            <Button disabled={isNavigating} onClick={goToCreate}>Create profile</Button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <DataTable
          columns={columns}
          data={profiles}
          isLoading={isLoading}
          enablePagination={false}
          enableSearch={false}
          enableViewOptions={false}
          tableClassName="table-fixed min-w-[900px] "
          className="shadow rounded-md"
          headerClassName="bg-muted/40 hover:bg-muted/40"
          footer={
            <div className="flex items-center justify-end">
              <span className="text-sm text-muted-foreground">
                {profiles.length} profile{profiles.length === 1 ? "" : "s"} ·{" "}
                {totalUsers} user{totalUsers === 1 ? "" : "s"} assigned
              </span>
            </div>
          }
        />
      </div>
    </Wrapper>
  );
};

export default ProfileList;
