import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/shared/services/api/queryKeys";
import { createProfile, updateProfile } from "./settingsEndpoints";

export const useCreateProfile = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfile,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      options.onSuccess?.(...args);
    },
    onError: (error, variables, context) => {
      // 1. Run the custom error handler if the user provided one
      options.onError?.(error, variables, context);
      
      // 2. If they didn't provide one, show the default toast
      if (!options.onError) {
        toast.error("Failed to create profile.");
      }
    },
  });
};

export const useUpdateProfile = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile, // expects { id, data }
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      options.onSuccess?.(...args);
    },
    onError: (...args) => {
      toast.error("Failed to update profile.");
      options.onError?.(...args);
    },
  });
};
