import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { useParams } from "react-router-dom";
import { useBacklog, useSprints } from "../api/backlog/backlogQueries";
import SprintDropzone from "../components/SprintDropzone";
import BacklogDropzone from "../components/BacklogDropzone";

const Backlog = () => {

  const {data} = useSprints();
  const {data:backlog} = useBacklog();
  return (
    <SectionWrapper>
      <h3 className="font-medium">Backlog</h3>


      <SprintDropzone />
      <BacklogDropzone />
    </SectionWrapper>
  );
};

export default Backlog;
