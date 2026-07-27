import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { useReports } from "../api/queries";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { formatDateLocal } from "@/shared/lib/helpers";
import PageLoader from "@/shared/components/layout/PageLoader";

const AllReports = () => {
  const navigate = useNavigate();
  const { data: reports, isLoading, isError } = useReports();

  const summary = reports?.summary ?? {};
  const staticReports = reports?.static_reports ?? [];
  const dynamicReports = reports?.dynamic_reports ?? [];

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return (
      <div className="space-y-4 p-4">
        <SectionWrapper>
          <h1 className="font-medium">Unable to load reports</h1>
          <p className="text-sm text-gray-600">
            Please refresh the page and try again.
          </p>
        </SectionWrapper>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <SectionWrapper>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium">Reports</h1>
            <p className="text-sm font-light text-gray-600">
              Analytics and insights for your projects
            </p>
          </div>

          <Button onClick={() => navigate("create-report")}>
            <Plus /> Create Report
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
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
        <h2 className="mb-4 font-medium">Overview & Performance</h2>

        {staticReports.length === 0 ? (
          <p className="text-sm text-gray-500">No overview reports available.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {staticReports.map((report) => (
              <StaticReportItem key={report.key} report={report} />
            ))}
          </div>
        )}
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-4 font-medium">Saved Reports</h2>

        {dynamicReports.length === 0 ? (
          <p className="text-sm text-gray-500">
            No saved reports yet. Create one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {dynamicReports.map((report) => (
              <DynamicReportItem key={report.id} report={report} />
            ))}
          </div>
        )}
      </SectionWrapper>
    </div>
  );
};

export default AllReports;

function SummaryCard({ title, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-semibold">{value ?? 0}</h3>
      </div>
    </div>
  );
}

function StaticReportItem({ report }) {
  return (
    <div className="rounded-md p-3 shadow">
      <h3 className="text-sm font-medium text-blue-600">{report.title}</h3>
      <p className="text-xs text-gray-500">{report.description}</p>
    </div>
  );
}

function DynamicReportItem({ report }) {
  const modules = [report.primary_module, report.associated_module]
    .filter(Boolean)
    .join(" → ");

  return (
    <NavLink
      to={`create-report/${report.id}`}
      state={{ report }}
      className="flex cursor-pointer flex-col gap-1 rounded-md p-3 shadow hover:bg-gray-50"
    >
      <h3 className="text-sm font-medium text-blue-600">
        {report.report_name || "Untitled Report"}
      </h3>
      <p className="text-xs text-gray-500">
        {report.description || modules || "Open to view and edit"}
      </p>
      {(report.created_by || report.modified_at) && (
        <p className="mt-1 text-[11px] text-gray-400">
          {[
            report.created_by,
            report.modified_at ? formatDateLocal(report.modified_at) : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </NavLink>
  );
}
