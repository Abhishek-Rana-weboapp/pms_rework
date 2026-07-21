import UserProfileDetails from "@/shared/components/UserProfileDetails";
import { useParams } from "react-router-dom";

// Detail page for an employee or a client. Both are userprofile records, so
// they share the settings profile view via UserProfileDetails. The route uses a
// specific param name per branch (`:employeeId` / `:clientId`) — avoids param
// collisions if either route ever gains a nested id — and we read whichever
// matched.
const PersonDetails = () => {
  const { employeeId, clientId } = useParams();
  return <UserProfileDetails userId={employeeId ?? clientId} />;
};

export default PersonDetails;
