import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createGlobalStatus, createPriority, createProjectType, inviteUser, updateGlobalStatus, updatePriority, updateProjectType, updateUser, updateUserProfile, uploadProfileImage } from "./settingsEndpoints";
import { queryKeys } from "@/shared/services/api/queryKeys";
import { hasFieldErrors } from "@/shared/lib/formErrors";

// Forms surface field-level validation errors inline (via applyServerFieldErrors),
// so a mutation should only toast for genuine failures (network, 5xx, non-field
// errors). Shares hasFieldErrors with the inline mapper so the two can't disagree
// about what counts as a field error. Call this from a mutation's onError before
// delegating to options.onError.
const toastServerError = (error, fallback = "Something went wrong.") => {
  if (!hasFieldErrors(error)) {
    toast.error(error?.response?.data?.errors || fallback);
  }
};

// Shared wrapper for the app's mutations: grabs the query client once, invalidates
// the given keys on success, and toasts genuine server errors — then delegates to
// any onSuccess/onError the caller passed. Each mutation only declares what's
// unique to it (mutationFn, which keys to refresh, the error message).
const useAppMutation = ({ invalidateKeys = [], errorMessage, ...options } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    onSuccess: (...args) => {
      invalidateKeys.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      );
      options.onSuccess?.(...args);
    },
    onError: (error, ...rest) => {
      toastServerError(error, errorMessage);
      options.onError?.(error, ...rest);
    },
  });
};

export const useUploadImage = (options = {}) => {
  const user_id = localStorage.getItem("user_id");

  return useAppMutation({
    mutationFn: uploadProfileImage,
    invalidateKeys: [queryKeys.currentUser.detail(user_id)],
    errorMessage: "Failed to upload image.",
    ...options,
  });
};

export const useUpdateProfile = (options = {}) => {
  const user_id = localStorage.getItem("user_id");

  return useAppMutation({
    mutationFn: updateUserProfile,
    invalidateKeys: [queryKeys.currentUser.detail(user_id)],
    errorMessage: "Failed to update profile.",
    ...options,
  });
};

export const useInviteUser = (options = {}) =>
  useAppMutation({
    mutationFn: inviteUser,
    invalidateKeys: [queryKeys.users.all],
    errorMessage: "Failed to invite user. Please try again.",
    ...options,
  });

export const useUpdateUser = (options = {}) =>
  useAppMutation({
    mutationFn: updateUser,
    invalidateKeys: [queryKeys.users.all],
    errorMessage: "Failed to update user. Please try again.",
    ...options,
  });

export const useCreatePriority = (options = {}) =>
  useAppMutation({
    mutationFn: createPriority,
    invalidateKeys: [queryKeys.priorities.all],
    errorMessage: "Failed to create priority.",
    ...options,
  });


export const useUpdatePriority = (options={}) => 
  useAppMutation({
    mutationFn: updatePriority,
    invalidateKeys: [queryKeys.priorities.all],
    errorMessage: "Failed to update priority.",
    ...options,
  });



  export const useCreateProjectType = (options={})=>useAppMutation({
      mutationFn:createProjectType,
      invalidateKeys:[queryKeys.projectTypes.all],
      errorMessage:"Failed to create project type",
      ...options
    })


  export const useUpdateProjectType = (options={})=>useAppMutation({
      mutationFn:updateProjectType,
      invalidateKeys:[queryKeys.projectTypes.all],
      errorMessage:"Failed to update project type",
      ...options
    })


  export const useCreateStatus = (options={})=>useAppMutation({
      mutationFn:createGlobalStatus,
      invalidateKeys:[queryKeys.globalStatus.all],
      errorMessage:"Failed to create status",
      ...options
    })


  export const useUpdateStatus = (options={})=>useAppMutation({
      mutationFn:updateGlobalStatus,
      invalidateKeys:[queryKeys.globalStatus.all],
      errorMessage:"Failed to update status",
      ...options
    })
  
