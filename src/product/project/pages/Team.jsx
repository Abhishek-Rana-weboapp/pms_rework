import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import React from "react";
import { useGetTeams } from "../api/team/teamQueries";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import TeamForm from "../components/TeamForm";

const Team = () => {
  const { data } = useGetTeams();
  console.log(data);

  return (
    <SectionWrapper>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Team</h3>
          <p className="text-sm text-muted-foreground">Manage your teams</p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button>Add Team</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team</DialogTitle>
              <DialogDescription>Manage Team Members</DialogDescription>
            </DialogHeader>

            <div>
              <TeamForm />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SectionWrapper>
  );
};

export default Team;
