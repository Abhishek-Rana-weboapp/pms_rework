import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import React from "react";
import { useReports } from "../api/queries";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";

const AllReports = () => {
  const { data: reports } = useReports();
  const summary = reports?.summary || {}

  return (
    <div className="p-4 space-y-4">
      <SectionWrapper>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-medium text-lg">Reports</h1>
            <p className="text-sm text-gray-600 font-light">Analytics and insights for your projects</p>
          </div>

          <Button><Plus /> Create Report</Button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <SummaryCard title="Total Projects" value={summary.total_projects} />
          <SummaryCard
            title="Active Employees"
            value={summary.active_employees}
          />
          <SummaryCard title="Active Clients" value={summary.active_clients} />
          <SummaryCard
            title="Completed Project"
            value={summary.completed_projects}
          />
        </div>
      </SectionWrapper>

      <SectionWrapper>
          <h2 className="font-medium">Overview & Performance</h2>
      </SectionWrapper>
    </div>
  );
};

export default AllReports;

const SummaryCard = ({ title, value }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow flex justify-between items-center ">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-semibold">{value || 0}</h3>
      </div>

      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        📊
      </div>
    </div>
  );
};

const ReportItem = ({ report }) => {
  return (
    <NavLink
      to={report.route}
      className="shadow rounded-md p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
    >
      <div>
        <h3 className="text-sm font-medium text-blue-600">{report.title}</h3>
        <p className="text-xs text-gray-500">{report.description}</p>
      </div>
    </NavLink>
  );
};
