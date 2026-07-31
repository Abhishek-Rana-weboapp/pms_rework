import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/lib/utils";
import { useArtifactChildren } from "../api/artifact/artifactQueries";
import ArtifactCard from "./ArtifactCard";
import {
  buildPriorityColorMap,
  normalizeArtifact,
} from "../config/artifacts/artifact.utils";
import { usePriorities } from "@/product/settings/api/settingsQueries";
import { Button } from "@/shared/components/ui/button";
import { useArtifactFormDialog } from "../context/ArtifactFormDialogStore";

const tabsConfig = [
  { label: "Task", value: "task", allowedParents: ["user_story"] },
  { label: "Issue", value: "issue", allowedParents: ["user_story"] },
  { label: "Spike", value: "spike", allowedParents: ["user_story"] },
  { label: "Test", value: "test", allowedParents: ["user_story"] },
];

const ArtifactChildrenSection = ({ artifact }) => {
  const { orgUuid, projectId, artifactType } = useParams();
  const navigate = useNavigate();
  const { openAdd } = useArtifactFormDialog();
  const [activeTab, setActiveTab] = useState(tabsConfig[0].value);
  const { data: priorities } = usePriorities();

  // Open the create form for the active child type, pre-linked to THIS artifact
  // as the parent. task_type is already uppercase (EPIC / USER_STORY), matching
  // the parent_type options; parent_artifact is this artifact's id.
  const handleAddChild = () =>
    openAdd(artifactType === "epic" ? "user_story" :  activeTab, {
      parent_type: artifact?.task_type,
      parent_artifact: artifact?.id,
    });

  // `type: activeTab` is part of the query key, so changing tabs is what drives
  // the fetch — no manual refetch. keepPreviousData (in the hook) keeps the old
  // tab's rows dimmed-but-visible while the new tab loads.
  const { data, isLoading, isError, isFetching } = useArtifactChildren({
    artifactId: artifact?.id,
    type:artifactType === "epic" ? "USER_STORY"  : activeTab,
  });
  const children = data?.results?.children ?? data ?? [];
  const priorityColorMap = buildPriorityColorMap(priorities);

  const rows = children.map((artifact) =>
    normalizeArtifact(artifact, { priorityColorMap }),
  );

  const renderPanel = (handleRowClick) => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-6">
          <Spinner className="text-muted-foreground" />
        </div>
      );
    }
    if (isError) {
      return (
        <p className="py-4 text-sm text-muted-foreground">
          Couldn't load {activeTab} children. Please try again.
        </p>
      );
    }
    if (!rows.length) {
      return (
        <p className="py-4 text-sm text-muted-foreground">
          No {activeTab} children yet.
        </p>
      );
    }
    return (
      <ul
        className={cn(
          "divide-y divide-border transition-opacity space-y-2",
          isFetching && "opacity-60",
        )}
      >
        {rows.map((child) => (
          <ArtifactCard key={child.id} artifact={child} onClick={handleRowClick} />
        ))}
      </ul>
    );
  };

  const handleChildClick = (childArtifact) => {
    navigate(
      `/${orgUuid}/projects/${projectId}/artifact/${childArtifact?.raw?.task_type.toLowerCase()}/${childArtifact?.id}`,
    );
  };

  return (
    <SectionWrapper>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          {artifactType !== "epic" ? <TabsList className="gap-5">
            {tabsConfig.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList> : <div className="font-medium ">User Story </div>}

          <Button onClick={handleAddChild} className={`capitalize`}>
            Add {artifactType === "epic" ? "User Story" :activeTab}
          </Button>
        </div>

        <TabsContent className={"mt-3"} value={activeTab}>
          {renderPanel(handleChildClick)}
        </TabsContent>
      </Tabs>
    </SectionWrapper>
  );
};

export default ArtifactChildrenSection;
