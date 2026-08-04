import api from "@/shared/services/api/axios";

export const getProjects = async ({ page, page_size, search } = {}) => {
  const params = {};
  if (page !== undefined) params.page = page;
  if (page_size !== undefined) params.page_size = page_size;
  if (search) params.search = search;
  const res = await api.get(`project`, { params });
  return res?.data?.data;
};

// Server-paginated employee list. Returns the full envelope
// `{ pagination, results }` so callers can drive page controls.
export const getAllEmployees = async ({
  page,
  page_size,
  search,
  status,
} = {}) => {
  const params = {};
  if (page !== undefined) params.page = page;
  if (page_size !== undefined) params.page_size = page_size;
  if (search) params.search = search;
  if (status !== undefined) params.status = status; // "true" | "false"
  const res = await api.get("employees/", { params });
  return res?.data?.data;
};

// Server-paginated client list. Returns the full envelope
// `{ pagination, results }` so callers can drive page controls.
export const getAllClients = async ({
  page,
  page_size,
  search,
  status,
} = {}) => {
  const params = {};
  if (page !== undefined) params.page = page;
  if (page_size !== undefined) params.page_size = page_size;
  if (search) params.search = search;
  if (status !== undefined) params.status = status; // "true" | "false"
  const res = await api.get("clients/", { params });
  return res?.data?.data;
};

export const getDashboard = async () => {
  const res = await api.get(`dashboard/`);
  return res.data.data;
};

export const getReports = async () => {
  const res = await api.get(`reports/home/`);
  return res.data.data;
};

export const getPrimaryModules = async () => {
  const res = await api.get("reports/modules/");
  return res.data.data;
};

export const getAssociatedModule = async (mainModule) => {
  const res = await api.get("reports/associated-modules/", {
    params: {
      primary_module: mainModule,
    },
  });
  return res.data.data;
};

export const getReportConfiguration = async (
  primaryModule,
  associatedModule,
) => {
  const payload = {
    primary_module: primaryModule,
  };

  if (associatedModule) {
    payload.associated_module = associatedModule;
  }

  const res = await api.post("reports/edit/", payload);
  return res.data.data;
};

export const generateReport = async (payload) => {
  const res = await api.post(`reports/generate/`, payload);
  return res.data.data;
};

export const getSavedReport = async (reportId) => {
  const res = await api.get(`reports/${reportId}/`);
  return res.data.data;
};

export const saveReport = async (payload) => {
  const res = await api.post("reports/save/", payload);
  return res.data.data;
};

export const updateReport = async ({ reportId, payload }) => {
  const res = await api.put(`reports/${reportId}/`, payload);
  return res.data.data;
};

export const createReportChart = async (payload) => {
  const res = await api.post("reports/charts/", payload);
  return res.data.data;
};

export const getReportChart = async (chartId) => {
  const res = await api.get(`reports/charts/${chartId}/`);
  return res.data.data;
};

export const updateReportChart = async ({ chartId, payload }) => {
  const res = await api.put(`reports/charts/${chartId}/`, payload);
  return res.data.data;
};

export const moveChartToDashboard = async (chartId, moveToDashboard = true) => {
  const res = await api.put(`reports/charts/${chartId}/dashboard/`, {
    move_to_dashboard: moveToDashboard,
  });
  return res.data.data;
};

export const deleteReportChart = async (chartId) => {
  const res = await api.delete(`reports/charts/${chartId}/`);
  return res.data.data;
};