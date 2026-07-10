import { queryKeys } from "@/shared/services/api/queryKeys"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getAllClients, getAllEmployees, getProjects } from "./endpoints"


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


export const useEmployees = (options = {})=>{
    return useQuery({
        queryKey:queryKeys.employees.all,
        queryFn:getAllEmployees,
        ...options
    })
}

export const useClients = ({ searchData = "", filterStatus = "" } = {}, options = {}) => {
    return useQuery({
        queryKey: queryKeys.clients.list({ searchData, filterStatus }),
        queryFn: () => getAllClients({ searchData, filterStatus }),
        ...options,
    })
}