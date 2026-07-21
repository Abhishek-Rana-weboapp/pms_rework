import { useParams } from "react-router-dom";
import { useArtifact } from "../api/artifact/artifactQueries";
import ArtifactDetailsHeading from "../components/ArtifactDetailsHeading";
import PageLoader from "@/shared/components/layout/PageLoader";
import AcceptanceCriteria from "../components/AcceptanceCriteria";
import ArtifactStatusDetails from "../components/ArtifactStatusDetails";
import ArtifactChildrenSection from "../components/ArtifactChildrenSection";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";

const hasChildren = [
  "epic", "user_story"
]

const ArtifactDetails = () => {
  const { artifactId , artifactType} = useParams();
  const { data: artifact, isLoading, isFetching } = useArtifact({ artifactId });

  if (isLoading || isFetching) {
    return <PageLoader />;
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <ArtifactDetailsHeading artifact={artifact} />
       <AcceptanceCriteria containerClassName={"col-span-2 "} artifact={artifact} />
       <div className={"lg:col-span-1 col-span-3 row-span-2 "} artifact={artifact} >
          <ArtifactStatusDetails artifact={artifact} />
       </div>
       <AcceptanceCriteria containerClassName={"col-span-2 "} artifact={artifact} />

       {hasChildren.includes(artifactType) && <div className="col-span-2">
          <ArtifactChildrenSection artifact={artifact} />
       </div>}

       <SectionWrapper className={"h-screen"}>

       </SectionWrapper>

    </div>
  );
};


export default ArtifactDetails;
