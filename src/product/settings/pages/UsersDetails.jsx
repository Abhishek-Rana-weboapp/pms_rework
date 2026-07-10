import { useCurrentUser } from "@/product/auth/hooks/useCurrentUser";
import { Button } from "@/shared/components/ui/button";
import Wrapper from "@/shared/components/wrappers/Wrapper";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const UsersDetails = () => {
  const navigate= useNavigate();
  const { userId } = useParams();

  const { data: userData } = useCurrentUser(userId);
  return (
    <Wrapper className={"space-y-6"}>
      <div className="bg-white rounded-md shadow p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold flex gap-2 items-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft />
          </Button>
          User Profile
        </h2>
        <div className="flex items-center gap-2">
          {/* <PermissionGate permission={action?.permission}> */}
          {/* {action && ( */}
          <Button
            variant="outline"
            // variant={action.variant}
            // onClick={() => action.handler(userData)}
          >
            re-invite
            {/* {action.label} */}
          </Button>
          {/* )} */}
          {/* </PermissionGate> */}

          {/* <PermissionGate permission={PERMISSIONS.USER.CHANGE}> */}
          <Button
          // onClick={() =>navigate(`/${orgUuid}/profile-settings/users/edit/${id}`)}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-start mb-6 gap-4">
        <div className="flex items-center gap-4">
          {userData?.user_image ? (
            <img
              src={userData.user_image}
              alt="profile"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border object-cover"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border flex items-center justify-center bg-gray-100">
              <span className="text-lg md:text-xl font-semibold text-gray-600 uppercase">
                {userData?.first_name ? userData?.first_name[0] : "NA"}
                {userData?.last_name ? userData?.last_name[0] : ""}
              </span>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 font-medium">
              {userData?.user_type === "Employee" ? "Emp-" : "Client-"}
              {userData?.id}
            </p>
            <div className="flex gap-2 align-middle">
              <h3 className="text-lg md:text-xl font-bold capitalize">
                {userData?.first_name || "NA"} {userData?.last_name}
              </h3>
              <span
                className={`inline-block ${`something`} text-xs font-semibold px-3 py-1 rounded-full`}
              >
                {userData?.employee_status}
              </span>
            </div>
            <p className="text-gray-600">
              {userData?.role_details?.role_name}
            </p>
          </div>
        </div>
        <a
          href={`mailto:${userData?.email}`}
          className="inline-flex items-center justify-center gap-2 rounded-md font-medium transition bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 text-sm"
        >
          Email
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="font-semibold mb-4">Personal Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm capitalize">
            {[
              { label: "First Name", value: userData?.first_name },
              { label: "Last Name", value: userData?.last_name },
              { label: "Gender", value: userData?.gender },
              {
                label: "Profile",
                value: userData?.profile_details?.profile_name || "NA",
              },
              {
                label: "Employee Role",
                value: userData?.role_details?.role_name || "NA",
              },
            ].map((item, i) => (
              <div key={i} className="max-w-full">
                <p className="text-gray-600 mb-1">{item?.label}</p>
                <p className="font-medium wrap-break-word overflow-hidden">
                  {item?.value}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="font-semibold mb-4">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm capitalize">
            {[
              {
                label: "Primary Contact Number",
                value: userData?.contact_number,
              },
              { label: "Email", value: userData?.email },
              { label: "Address", value: userData?.current_address },
            ].map((item, i) => (
              <div
                key={i}
                className={`max-w-full ${i === 2 ? "md:col-span-2" : ""}`}
              >
                <p className="text-gray-600 mb-1">{item?.label}</p>
                <p className="font-medium wrap-break-word overflow-hidden whitespace-pre-wrap">
                  {item.value || "NA"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default UsersDetails;
