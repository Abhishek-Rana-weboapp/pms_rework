import { queryKeys } from "@/shared/services/api/queryKeys"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getArtifactChildren, getArtifactDetails } from "./artifactEndpoints"


export const useArtifact = ({artifactId}, options={})=>{
    return useQuery({
        queryKey:queryKeys.artifacts.detail(artifactId),
        queryFn:()=>getArtifactDetails(artifactId),
        enabled:!!artifactId,
        ...options
    })
}


// Children of an artifact for a given tab (`type`). Because `type` is part of
// the query key, switching tabs is what triggers the refetch — no manual
// refetch() needed. keepPreviousData keeps the previous tab's rows visible
// while the new tab loads, avoiding an empty flash on every switch.
export const useArtifactChildren = ({ artifactId, type }, options = {}) => {
    return useQuery({
        queryKey: queryKeys.artifacts.children(artifactId, type),
        queryFn: () => getArtifactChildren({ artifactId, type }),
        enabled: !!artifactId && !!type,
        placeholderData: keepPreviousData,
        ...options,
    })
}
