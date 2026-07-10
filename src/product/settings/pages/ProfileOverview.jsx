import { useCurrentUser } from "@/product/auth/hooks/useCurrentUser";
import { useAuth } from "@/app/providers/AuthContext";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Camera } from "lucide-react";
import React, { useState } from "react";
import { useUploadImage } from "../api/settingsMutations";
import { createFullName } from "@/shared/lib/helpers";
import { Badge } from "@/shared/components/ui/badge";
import UserProfileForm from "../components/UserProfileForm";
import Wrapper from "@/shared/components/wrappers/Wrapper";
import { Spinner } from "@/shared/components/ui/spinner";

const ProfileOverview = () => {
  const { userId } = useAuth();
  const { data: user, isLoading } = useCurrentUser(userId);

  const [preview, setPreview] = useState(null);
  const { mutate } = useUploadImage();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    mutate({ file, userId: user?.id });
    e.target.value = "";
  };

  if (isLoading) {
    return <Wrapper className={"flex  justify-center items-center p-4"}>
      <Spinner className={"size-8"} />
    </Wrapper>
  }

  return (
    <Wrapper>
      <div className=" bg-white shadow rounded-md md:p-4 p-2">
        <h1 className="font-medium mb-4 text-lg">Profile Overview </h1>

        <div className="flex items-center gap-4">
          <div className="relative size-20">
            <Avatar className="size-20">
              <AvatarImage
                src={preview ?? user?.user_image}
                alt={user?.name ?? "avatar"}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <label
              htmlFor="avatar-upload"
              aria-label="Upload profile photo"
              className="absolute bottom-0 right-0 z-10 grid size-6 cursor-pointer place-items-center rounded-full bg-primary-foreground text-foreground ring-2 ring-background transition-colors hover:bg-primary/90 hover:text-primary-foreground"
            >
              <Camera className="size-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="md:text-lg font-medium">{createFullName(user)}</h2>
              <Badge variant="cloud">{user?.role_details.role_name}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 bg-white md:p-4 p-2 shadow rounded-md">
        <UserProfileForm />
      </div>
    </Wrapper>
  );
};

export default ProfileOverview;
