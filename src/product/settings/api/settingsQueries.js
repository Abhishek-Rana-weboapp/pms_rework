import { queryKeys } from "@/shared/services/api/queryKeys";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getAllbranches,
  getAllGlobalStatuses,
  getAllPriorities,
  getAllProjectTypes,
  getAllUsers,
  getAuditLogs,
  getBranch,
  getOrganizationSettings,
  getPermissions,
  getProfile,
  getProfiles,
  getUser,
} from "./settingsEndpoints";

export const useProjectTypes = () => {
  return useQuery({
    queryKey: queryKeys.projectTypes.all,
    queryFn: getAllProjectTypes,
    staleTime: Infinity, // never refetch unless invalidated
  });
};

export const usePriorities = () => {
  return useQuery({
    queryKey: queryKeys.priorities.all,
    queryFn: getAllPriorities,
    staleTime: Infinity,
  });
};

export const useGlobalStatus = () => {
  return useQuery({
    queryKey: queryKeys.globalStatus.all,
    queryFn: getAllGlobalStatuses,
    staleTime: Infinity,
  });
};

export const useProfiles = () => {
  return useQuery({
    queryKey: queryKeys.profiles.all,
    queryFn: getProfiles,
    staleTime: Infinity,
  });
};

export const useProfile = (id) => {
  return useQuery({
    queryKey: queryKeys.profiles.detail(id),
    queryFn: () => getProfile(id),
    enabled: !!id,
  });
};

export const usePermissions = () => {
  return useQuery({
    queryKey: queryKeys.permissions.all,
    queryFn: getPermissions,
    staleTime: Infinity,
  });
};


export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: getAllUsers,
    staleTime: Infinity,
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  });
};

export const useOrganizationSettings = (orgId) => {
  return useQuery({
    queryKey: queryKeys.organization.detail(orgId),
    queryFn: () => getOrganizationSettings(orgId),
    enabled: !!orgId,
  });
};


export const useBranches = ()=>{
  return useQuery({
    queryKey:queryKeys.branches.all,
    queryFn:getAllbranches
  })
}

// Paginated audit-log feed. `filters` holds the active date range / user / module
// / search; each distinct filter set is its own cached, infinitely-paged list.
// `next` (a full DRF page URL) just signals whether another page exists — we page
// by incrementing the page number, which the endpoint reads from `params`.
export const useAuditLogs = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.auditLogs.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      getAuditLogs({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage?.next ? allPages.length + 1 : undefined,
  });
};

// Single branch for the detail page. Seeds from the branches list cache so the
// page paints instantly on navigation, then refetches the full record fresh.
export const useBranch = (id) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.branches.detail(id),
    queryFn: () => getBranch(id),
    enabled: !!id,
    initialData: () =>
      queryClient
        .getQueryData(queryKeys.branches.all)
        ?.find((b) => String(b.id) === String(id)),
  });
};
