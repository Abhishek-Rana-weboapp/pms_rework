import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import {
  createFullName,
  createInitials,
  createInitialsFromSingleName,
} from "@/shared/lib/helpers";
import { Clock, ListChecks } from "lucide-react";

const ResourceUtilizationSection = ({ data }) => {
  return (
    <SectionWrapper>
      <h3 className="font-semibold mb-4">Resource Utilization</h3>

      <div className="flex flex-col gap-3">
        {data?.map((performer, index) => {
          return (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={performer.user_image}
                    alt={performer.name}
                  />
                  <AvatarFallback>
                    {createInitialsFromSingleName(performer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm">{performer.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-4">
                    <span className="flex items-center gap-1"><ListChecks className="size-3" />{performer.tasks} Tasks</span>
                    <span className="flex items-center gap-1"> <Clock className="size-3" />{performer.hours}</span>
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-primary/90">{performer.utilization} %</p>
                <p className="text-xs text-gray-500">UTILIZATION</p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
};

export default ResourceUtilizationSection;
