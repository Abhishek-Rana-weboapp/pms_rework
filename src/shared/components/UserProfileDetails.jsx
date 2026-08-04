import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useCurrentUser } from "@/product/auth/api/authQueries";
import PermissionGate from "@/product/auth/components/PermissionGate";
import { PERMISSIONS } from "@/product/auth/config/permissions";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import Wrapper from "@/shared/components/wrappers/Wrapper";

// Shared profile detail view. Users, employees and clients are all the same
// userprofile record in our design, so this single component backs all three
// detail routes — each route passes the id it reads from its own params.
const UserProfileDetails = ({ userId }) => {
  const navigate = useNavigate();
  // `orgUuid` comes from the app-level `/:orgUuid` route (merged params).
  const { orgUuid } = useParams();
  const { data: userData, isLoading } = useCurrentUser(userId);

  // Edit reuses the settings invite form in edit mode; it's the single
  // userprofile editor, so employees/clients edit through it too.
  const goToEdit = () =>
    navigate(`/${orgUuid}/profile-settings/users/userform/${userId}`);

  if (isLoading) {
    return (
      <Wrapper className="flex justify-center">
        <Spinner />
      </Wrapper>
    );
  }

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
          <PermissionGate permission={PERMISSIONS.USER.REINVITE}>
            <Button variant="outline">Re-invite</Button>
          </PermissionGate>

          <PermissionGate permission={PERMISSIONS.USER.CHANGE}>
            <Button onClick={goToEdit}>Edit Profile</Button>
          </PermissionGate>
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

export default UserProfileDetails;
