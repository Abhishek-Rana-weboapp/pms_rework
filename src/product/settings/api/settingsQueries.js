import { queryKeys } from "@/shared/services/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import {
  getAllGlobalStatuses,
  getAllPriorities,
  getAllProjectTypes,
  getAllUsers,
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
