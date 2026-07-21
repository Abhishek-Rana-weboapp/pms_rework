import UserProfileDetails from "@/shared/components/UserProfileDetails";
import { useParams } from "react-router-dom";

const UsersDetails = () => {
  const { userId } = useParams();
  return <UserProfileDetails userId={userId} />;
};

export default UsersDetails;
