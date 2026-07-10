import { queryKeys } from "@/shared/services/api/queryKeys"
import { useQuery } from "@tanstack/react-query"
import { getAllRolesTree } from "./settingsEndpoints"

export const useRolesTree = ()=>{
    return useQuery({
        queryKey:queryKeys.roles.all,
        queryFn:getAllRolesTree,
        staleTime:Infinity
    })
}