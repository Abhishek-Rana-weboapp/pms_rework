import { queryKeys } from "@/shared/services/api/queryKeys"
import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query"
import { getAllClients, getAllEmployees, getAssociatedModule, getDashboard, getPrimaryModules, getProjects, getReportChart, getReportConfiguration, getReports, getSavedReport } from "./endpoints"


/**
 * Server-paginated project list.
 *
 * @param {{ page?: number, page_size?: number, search?: string }} [filters]
 * @param {Partial<import("@tanstack/react-query").UseQueryOptions>} [options]
 */
export const useProjects = ({ page = 1, page_size = 10, search = "" } = {}, options = {})=>{
    const filters = { page, page_size, search };
    return useQuery({
         queryKey:queryKeys.projects.list(filters),
         queryFn:()=>getProjects(filters),
         placeholderData:keepPreviousData, // keep the current page visible while the next loads
         ...options
    })
}


/**
 * Server-paginated employee list. Search + status are applied on the server so
 * paging stays consistent with the active filters. `status` is the active flag
 * as "true" | "false" (omit for all).
 *
 * @param {{ page?: number, pageSize?: number, searchData?: string, status?: string }} [filters]
 */
export const useEmployees = (
    { page = 1, pageSize = 20, searchData = "", status } = {},
    options = {},
) => {
    const filters = {
        page,
        page_size: pageSize,
        search: searchData,
        status,
    };
    return useQuery({
        queryKey: queryKeys.employees.list(filters),
        queryFn: () => getAllEmployees(filters),
        placeholderData: keepPreviousData, // keep the current page visible while the next loads
        ...options,
    })
}

/**
 * Server-paginated client list. Mirrors {@link useEmployees}: search + status
 * are applied on the server. `status` is the active flag as "true" | "false".
 *
 * @param {{ page?: number, pageSize?: number, searchData?: string, status?: string }} [filters]
 */
export const useClients = (
    { page = 1, pageSize = 20, searchData = "", status } = {},
    options = {},
) => {
    const filters = {
        page,
        page_size: pageSize,
        search: searchData,
        status,
    };
    return useQuery({
        queryKey: queryKeys.clients.list(filters),
        queryFn: () => getAllClients(filters),
        placeholderData: keepPreviousData,
        ...options,
    })
}



export const useDashboard = ()=>{
    return useQuery({
        queryKey:queryKeys.dashboard.all,
        queryFn:getDashboard
    })
}


export const useReports = ()=>{
    return useQuery({
        queryKey:queryKeys.reports.all,
        queryFn:getReports
    })
}


export const usePrimaryModules = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.reports.primaryModule(),
    queryFn: getPrimaryModules,
    ...options,
  });
};

export const useAssociatedModules = (mainModule, options = {}) => {
  const { enabled = true, ...rest } = options;

  return useQuery({
    queryKey: queryKeys.reports.associatedModule(mainModule),
    queryFn: () => getAssociatedModule(mainModule),
    enabled: !!mainModule && enabled,
    ...rest,
  });
};

export const useSavedReport = (reportId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.reports.detail(reportId),
    queryFn: () => getSavedReport(reportId),
    enabled: !!reportId,
    ...options,
  });
};

export const useReportConfiguration = (
  mainModule,
  associatedModule,
  options = {},
) => {
  const { enabled = true, ...rest } = options;

  return useQuery({
    queryKey: queryKeys.reports.configuration(mainModule, associatedModule),
    queryFn: () => getReportConfiguration(mainModule, associatedModule),
    enabled: Boolean(mainModule) && enabled,
    ...rest,
  });
};

/**
 * Fetch full chart payloads for dashboard chart stubs (`dashboard_charts`).
 */
export const useDashboardCharts = (charts = []) => {
  return useQueries({
    queries: charts.map((chart) => ({
      queryKey: queryKeys.reports.chart(chart.id),
      queryFn: () => getReportChart(chart.id),
      enabled: Boolean(chart?.id),
      retry: 1,
    })),
  });
};