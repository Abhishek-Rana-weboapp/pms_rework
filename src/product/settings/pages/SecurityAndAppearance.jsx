import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import Wrapper from "@/shared/components/wrappers/Wrapper";
import ChangePasswordForm from "../components/ChangePasswordForm";
import { KeyRound, Lock } from "lucide-react";
import React, { useState } from "react";

const SecurityAndAppearance = () => {
    const [open, setOpen] = useState(false);
  return (
    <Wrapper>
      <div className="bg-white p-4 rounded-md shadow">
        <h1 className="text-lg font-medium pb-3 mb-2 border-b border-neutral-300">
          Security Settings
        </h1>

        <div className="flex items-center justify-between">
          
          <div className="flex gap-4 items-center mt-4">
            <div className="p-2 rounded-lg bg-primary/10">
               <KeyRound className="size-6 text-primary" />
            </div>
            <div>
              <h2 className="text-md font-medium ">Change Password</h2>
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure.
              </p>
            </div>
          </div>

          <Button onClick={() => setOpen(true)}>Change Password</Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}> 
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-primary/10">
                <Lock className="size-6 text-primary" />
              </div>
              <DialogTitle className="text-xl font-semibold">
                Change Password
              </DialogTitle>
              <DialogDescription>
                Please enter your current password and choose a new secure
                password for your account.
              </DialogDescription>
            </div>
          </DialogHeader>

          <ChangePasswordForm onCancel={() => setOpen(false)} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </Wrapper>
  );
};

export default SecurityAndAppearance;
