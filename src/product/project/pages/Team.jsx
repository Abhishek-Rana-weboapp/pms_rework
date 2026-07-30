import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { createFullName } from "@/shared/lib/helpers";
import { Mail, Phone } from "lucide-react";

const Team = () => {
  const { data: team=[] } = useGetTeams();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const closeForm = () => setIsFormOpen(false);

  return (
    <>
    <SectionWrapper>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Team</h3>
          <p className="text-sm text-muted-foreground">
            {team?.length
              ? `${team.length} member${team.length > 1 ? "s" : ""} on this project`
              : "Manage your teams"}
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>Add Team</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team</DialogTitle>
              <DialogDescription>Manage Team Members</DialogDescription>
            </DialogHeader>

            <TeamForm onSuccess={closeForm} onCancel={closeForm} />
          </DialogContent>
        </Dialog>
      </div>
    </SectionWrapper>
    <SectionWrapper>
    <div className="p-4 rounded-lg border border-gray-300 grid md:grid-cols-2 gap-4 bg-white">
          {team.length > 0 ? (
            team.map((member, index) => (
              <TeamCard key={index} member={member} />
            ))
          ) : (
            <p className="text-gray-500">No team members found.</p>
          )}
        </div>
    </SectionWrapper>
    </>
  );
};

export default Team;


const TeamCard = ({ member }) => {
  return (
    <div className="bg-white border border-gray-300 space-y-1 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      {/* Avatar */}
      <div className="flex items-start gap-3">
        <Avatar className="size-10">
          <AvatarImage src={member.user_image} />
          <AvatarFallback>{member.first_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className=" font-semibold text-gray-800">
            {createFullName(member)}
          </h3>
          <p className="text-xs  text-gray-500">{member.role || "Developer"}</p>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-500 mb-2">{member.user_type}</p>

        <div className="flex items-start text-xs text-gray-500 gap-1 min-w-0">
          <Mail size={14} className="shrink-0 mt-0.5" />
          <span className="break-all">{member.email}</span>
        </div>

        <div className="flex items-center text-xs text-gray-500 gap-1 mt-1">
          <Phone size={14} />
          <span>{member.contact_number}</span>
        </div>
      </div>
    </div>
  );
};
