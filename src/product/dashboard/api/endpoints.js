import api from "@/shared/services/api/axios"

export const getProjects = async ({ page, page_size, search } = {}) => {
    const params = {};
    if (page !== undefined) params.page = page;
    if (page_size !== undefined) params.page_size = page_size;
    if (search) params.search = search;
    const res = await api.get(`project`, { params });
    return res?.data?.data;
}


export const getAllEmployees = async ({
 searchData,
 filterStatus,
} = {}) => {
 let params = {};
 if (searchData) params.search = searchData;
 if (filterStatus !== undefined && filterStatus !== null) params.status = filterStatus;
 const res = await api.get("employees/", { params });
 return  res.data.data.results
};


export const getAllClients = async ({
 searchData,
 filterStatus,
} = {}) => {
 let params = {};
 if (searchData) params.search = searchData;
 if (filterStatus !== undefined && filterStatus !== null) params.status = filterStatus;
 const res = await api.get("clients/", { params });
 return  res.data.data.results
};