import { useParams } from "react-router-dom";
import { useArtifact } from "../api/artifact/artifactQueries";
import ArtifactDetailsHeading from "../components/ArtifactDetailsHeading";
import PageLoader from "@/shared/components/layout/PageLoader";
import AcceptanceCriteria from "../components/AcceptanceCriteria";
import ArtifactStatusDetails from "../components/ArtifactStatusDetails";
import ArtifactChildrenSection from "../components/ArtifactChildrenSection";
import ImplementationPlan from "../components/ImplementationPlan";
import CommentsSection from "../components/CommentsSection";

const hasChildren = ["epic", "user_story"];

const ArtifactDetails = () => {
  const { artifactId, artifactType } = useParams();
  const { data: artifact, isLoading, isFetching } = useArtifact({ artifactId });

  if (isLoading || isFetching) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col gap-5">
      <ArtifactDetailsHeading artifact={artifact} />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        <aside className="min-w-0 order-1 lg:order-2 lg:sticky lg:top-3 lg:col-span-1">
          <ArtifactStatusDetails artifact={artifact} />
        </aside>

        <div className="flex min-w-0 flex-col gap-5 order-2 lg:order-1 lg:col-span-2">
          <AcceptanceCriteria artifact={artifact} />
          <ImplementationPlan artifact={artifact} />

          {hasChildren.includes(artifactType) && (
            <ArtifactChildrenSection artifact={artifact} />
          )}

          <CommentsSection artifact={artifact} />
        </div>
      </div>
    </div>
  );
};

export default ArtifactDetails;
