import api from "@/shared/services/api/axios";

export const getAllProjectTypes = async () => {
  const res = await api.get(`project-type/`);
  return res?.data?.data?.results;
};

export const getAllGlobalStatuses = async () => {
  const res = await api.get(`global-status/`);
  return res?.data?.data?.results;
};

export const getAllPriorities = async () => {
  const res = await api.get(`priority/`);
  return res.data.data.results;
};


export const uploadProfileImage = async ({ file, userId }) => {
  const formData = new FormData();
  formData.append("user_image", file);
  const res = await api.put(`/userprofile/${userId}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};


export const updateUserProfile = async({data, userId})=>{
     const res = await api.put(`/userprofile/${userId}/`, data)
     return res;
}


export const getProfiles = async()=>{
  const res  = await api.get(`profile/`)
  return res.data.results;
}

// Single profile (role/permission-set) for the edit form.
export const getProfile = async (id) => {
  const res = await api.get(`profile/${id}/`);
  return res.data;
};

export const createProfile = async (data) => {
  const res = await api.post(`profile/`, data);
  return res.data;
};

export const updateProfile = async ({ id, data }) => {
  const res = await api.put(`profile/${id}/`, data);
  return res.data;
};

// Grouped permission catalog: { "user": [{ id, name, codename }...], ... }
export const getPermissions = async () => {
  const res = await api.get(`permissions/`);
  return res.data?.data ?? res.data;
};



export const getAllRolesTree = async()=>{
  const res = await api.get(`role/tree/`);
  return res.data?.data?.results?.roles 
}




export const createPriority = async(data)=>{
  const res = await api.post(`priority/`, data)
  return res.data?.data
}


export const updatePriority = async({data, id})=>{
  const res = await api.put(`priority/${id}/`, data)
  return res.data?.data;
}


export const createProjectType = async(data)=>{
  const res = await api.post(`project-type/`, data)
  return res.data?.data
}


export const updateProjectType = async({data, id})=>{
  const res = await api.put(`project-type/${id}/`, data)
  return res.data?.data;
}


export const createGlobalStatus = async(data)=>{
  const res = await api.post(`global-status/`, data)
  return res.data?.data
}


export const updateGlobalStatus = async({data, id})=>{
  const res = await api.put(`global-status/${id}/`, data)
  return res.data?.data;
}


export const getAllUsers = async()=>{
  const res = await api.get(`userprofile/`)
  return res.data?.results;
}


// Single user for the edit form. Adjust the unwrap if your detail endpoint
// nests the record differently.
export const getUser = async (id) => {
  const res = await api.get(`userprofile/${id}/`);
  return res.data?.data ?? res.data;
};

// Invite a new user. Expects a FormData (multipart) so the profile image can
// ride along; the backend endpoint differs from the update endpoint.
export const inviteUser = async (formData) => {
  const res = await api.post(`auth/invite-user/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update an existing user. Also multipart to support the optional image.
export const updateUser = async ({ id, formData }) => {
  const res = await api.put(`userprofile/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ── Organization / company settings ──────────────────────────────────────────
// NOTE: `orgId` is the org's UUID (route param `orgUuid` / user.organization_uuid);
// the legacy app used a numeric organization_id. Confirm the backend keys off the
// UUID here — this is the single spot to change if it expects a different id.
export const getOrganizationSettings = async (orgId) => {
  const res = await api.get(`organizationsettings/${orgId}/`);
  return res?.data?.data ?? res?.data;
};

// Multipart so the logo file can ride along with the text fields.
export const updateOrganizationSettings = async ({ orgId, formData }) => {
  const res = await api.put(`organizationsettings/${orgId}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.data ?? res?.data;
};


export const getAllbranches = async()=>{
  const res = await api.get(`branch/`)
  return res?.data.data ?? res?.data;
}

// Single branch for the detail page.
export const getBranch = async (id) => {
  const res = await api.get(`branch/${id}/`);
  return res?.data?.data ?? res?.data;
};

// Multipart so the branch logo file can ride along with the text fields.
export const createBranch = async (formData) => {
  const res = await api.post(`branch/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.data ?? res?.data;
};

export const updateBranch = async ({ id, formData }) => {
  const res = await api.put(`branch/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.data ?? res?.data;
};

// ── Audit logs ────────────────────────────────────────────────────────────────
// Paginated activity feed. `params` carries the active filters (page, date range,
// user, module, search). Returns the raw DRF page: { results, next, count }.
export const getAuditLogs = async (params) => {
  const res = await api.get(`auth/audit-logs/`, { params });
  return res?.data;
};


export const createRole = async(payload) =>{
  const res = await api.post(`role/`, payload);
  return res?.data;
}

export const updateRole = async({ id, payload }) =>{
  const res = await api.put(`role/${id}/`, payload);
  return res?.data;
}

export const deleteRole = async(id) =>{
  const res = await api.delete(`role/${id}/`);
  return res?.data;
}
