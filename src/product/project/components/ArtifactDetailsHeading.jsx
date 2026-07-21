import { humanize } from "../config/artifacts/artifactConfig";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useArtifactFormDialog } from "../context/ArtifactFormDialogStore";
import { ArrowLeft, Edit } from "lucide-react";
import ShowMore from "@/shared/components/ui/ShowMore";
import RichText from "@/shared/components/RichText";
import ArtifactStatusBadge from "./ArtifactStatusBadge";
import { buildPriorityColorMap } from "../config/artifacts/artifact.utils";
import { usePriorities } from "@/product/settings/api/settingsQueries";

const ArtifactDetailsHeading = ({ artifact }) => {
  const navigate = useNavigate();
  const { artifactType } = useParams();
  const { openEdit } = useArtifactFormDialog();
  const {data:priorities} = usePriorities();
  const priorityColors = buildPriorityColorMap(priorities)


  return (
    <SectionWrapper className={"col-span-3"}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-start gap-1">
          <button className="py-1 cursor-pointer hover:text-primary" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 " />
          </button>
          <div>
            <h3>{artifact?.title}</h3>
            <div className="space-x-3">
              <Badge>{humanize(artifactType)}</Badge>
              <ArtifactStatusBadge
                status={artifact?.status_detail?.status_name}
                category={artifact?.status_detail?.category}
              />
              <Badge style={{
                background: priorityColors[artifact?.priority?.id].bg,
                color: priorityColors[artifact?.priority?.id].text,
              }} >{artifact?.priority?.priority}</Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => openEdit(artifact)}>
          <Edit />
          Update
        </Button>
      </div>

      <div className="mt-4">
        <ShowMore>
          <RichText
            html={artifact?.description}
            fallback={
              <span className="text-muted-foreground">No description</span>
            }
          />
        </ShowMore>
      </div>
    </SectionWrapper>
  );
};

export default ArtifactDetailsHeading;

