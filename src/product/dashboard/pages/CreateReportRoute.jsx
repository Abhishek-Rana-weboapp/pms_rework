import { useParams } from "react-router-dom";
import { ReportBuilderProvider } from "../context/ReportBuilderContext";
import CreateReport from "../pages/CreateReport";

/**
 * Remounts the builder when switching create ↔ edit (or between reports)
 * so reducer state never leaks across modes.
 */
export default function CreateReportRoute() {
  const { reportId } = useParams();

  return (
    <ReportBuilderProvider key={reportId ?? "create"}>
      <CreateReport />
    </ReportBuilderProvider>
  );
}
