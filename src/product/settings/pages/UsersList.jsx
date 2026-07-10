import React from "react";
import { useUsers } from "../api/settingsQueries";
import Wrapper from "@/shared/components/wrappers/Wrapper";
import { Button } from "@/shared/components/ui/button";
import DataTable from "@/shared/components/data-table/DataTable";
import { getUsersTableColumns } from "@/shared/components/data-table/columns/UsersColumns";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const UsersList = () => {
  const navigate = useNavigate();
  const { data } = useUsers();

  const columns = getUsersTableColumns({
    onEdit: (user) => navigate(`userform/${user.id}`),
  });

  const handleRowClick = (row) => {
       navigate(`${row.id}`)
  };

  return (
    <Wrapper>
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-md shadow flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Users</h1>
              <p className="text-sm text-gray-500 ">
                Manage users, create and update
              </p>
            </div>
            <Button onClick={()=>navigate("userform")}>Invite</Button>
          </div>
          <div className="bg-white p-4 rounded-md shadow ">
            <DataTable onRowClick={handleRowClick} columns={columns} data={data || []} />
          </div>
        </div>
    </Wrapper>
  );
};

export default UsersList;
