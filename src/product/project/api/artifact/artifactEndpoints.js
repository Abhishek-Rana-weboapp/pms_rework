import api from "@/shared/services/api/axios"

export const getArtifactDetails = async(id)=>{
    const res = await api.get(`artifact/${id}`);
    return res.data?.data?.artifact;
}


// Mutation endpoints take ONE object argument: react-query's mutate(variables)
// forwards exactly one value to mutationFn, so a multi-parameter signature gets
// silently truncated (payload would arrive undefined). Mirrors
// updateProject({ id, formData }) in projectEndpoints.
export const createArtifact = async ({ projectId, payload }) => {
   // Loud failure over a silent POST to project/undefined/... — projectId is
   // route-derived (useCreateArtifact), so this only trips if the hook is used
   // outside the :projectId route subtree. Mirrors getArtifactsList's guard.
   if (!projectId) throw new Error("projectId is required");
   const res = await api.post(`project/${projectId}/artifacts/`, payload)
   return res.data?.data
}


export const updateArtifact = async ({ id, payload }) => {
    const res = await api.put(`artifact/${id}/`, payload)
    return res.data?.data;
}


// Child artifacts of `artifactId`, filtered by task_type (the active tab).
// NOTE: the children route is a best guess — adjust the path if the backend
// exposes children elsewhere (e.g. project/<id>/artifacts/?parent=<id>).
// `type` is a lowercase tab value ("task"); task_type is uppercase on the API.
export const getArtifactChildren = async ({ artifactId, type }) => {
    if (!artifactId) throw new Error("artifactId is required");
    const res = await api.get(`artifact/${artifactId}/children/`, {
        params: { ...(type && { task_type: type.toUpperCase() }) },
    });
    return res.data?.data;
}