import { humanize } from "@/product/project/config/artifacts/artifactConfig";
import { CheckCheck, Clock, ListChecks, Users } from "lucide-react";
import React from "react";

const DashboardSummaryCards = ({ title, value }) => {
  const metaData = {
    active_projects: {
      icon: <ListChecks className="md:size-6 size-4 " />,
      color: "text-blue-700",
      bg: "bg-blue-200",
    },
    completed_projects: {
      icon: <CheckCheck className="md:size-6 size-4 " />,
      color: "text-green-700",
      bg: "bg-green-200",
    },
    pending_projects: {
      icon: <Clock className="md:size-6 size-4 " />,
      color: "text-orange-700",
      bg: "bg-orange-200",
    },
    team_members: {
      icon: <Users className="md:size-6 size-4 " />,
      color: "text-purple-700",
      bg: "bg-purple-200",
    },
  };

  return (
    <div className="w-full flex flex-col items-start bg-white p-4 rounded-md shadow gap-2">
      <div className="flex items-center gap-2">
        <div
          className={`p-2 rounded-lg ${metaData[title].color} ${metaData[title].bg} `}
        >
          {metaData[title].icon}
        </div>
        <div className="font-medium text-gray-700">{humanize(title)}</div>
      </div>
      <div className="text-xl font-semibold pl-3">{value}</div>
    </div>
  );
};

export default DashboardSummaryCards;
