import { useMemo } from "react";
import { buildGroupedReportModel } from "./buildGroupedReportModel";

export function useGroupedReportTable(data) {
  return useMemo(() => buildGroupedReportModel(data), [data]);
}
