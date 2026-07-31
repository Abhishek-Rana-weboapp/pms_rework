import { useState } from "react";

import { Spinner } from "@/shared/components/ui/spinner";
import { createFullName } from "@/shared/lib/helpers";
import { useArtifact } from "../api/artifact/artifactQueries";
import AttachmentsPreviewSection from "./AttachmentsPreviewSection";
import DocumentFormDialog from "./DocumentFormDialog";
import DocumentsArtifactList from "./DocumentsArtifactList";

const DocumentsArtifactSection = ({ type }) => {
  // Only the id is state: the artifact itself stays in the query cache, so the
  // preview can't go stale against the server after an upload or an edit.
  const [selectedArtifactId, setSelectedArtifactId] = useState(null);
  const { data: artifact, isLoading } = useArtifact({
    artifactId: selectedArtifactId,
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row">
      <div className="flex h-full min-h-0 w-full shrink-0 flex-col lg:max-w-72">
        <DocumentsArtifactList
          type={type}
          selectedArtifactId={selectedArtifactId}
          onSelect={setSelectedArtifactId}
        />
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto lg:border-l lg:border-border lg:pl-4">
        {!selectedArtifactId ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-muted-foreground">
              Select an artifact to preview
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <AttachmentsPreviewSection
            {...buildAttachmentsPreviewData(artifact)}
            action={
              <DocumentFormDialog
                target="artifact"
                targetId={selectedArtifactId}
              />
            }
          />
        )}
      </div>
    </div>
  );
};

export default DocumentsArtifactSection;

function buildAttachmentsPreviewData(artifact = {}) {
  return {
    id: artifact.id,
    title: artifact.title,
    type: artifact.task_type,
    assignee:
      createFullName(artifact.developer) ||
      createFullName(artifact.created_by) ||
      "N/A",
    priority: artifact.priority?.priority,
    status: artifact.status_detail?.status_name,
    dueDate: artifact.target_date || null,
    attachments: artifact.attachments_details || [],
  };
}
