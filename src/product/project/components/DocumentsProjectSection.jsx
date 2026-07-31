import { createFullName } from "@/shared/lib/helpers";
import { useCurrentProject } from "../api/project/projectQueries";
import AttachmentsPreviewSection from "./AttachmentsPreviewSection";
import DocumentFormDialog from "./DocumentFormDialog";

const DocumentsProjectSection = () => {
  const { data: project } = useCurrentProject();

  if (!project) return null;

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <AttachmentsPreviewSection
        {...buildAttachmentsPreviewData(project)}
        action={<DocumentFormDialog target="project" targetId={project.id} />}
      />
    </div>
  );
};

export default DocumentsProjectSection;

function buildAttachmentsPreviewData(project) {
  return {
    id: project.id,
    title: project.project_name,
    assignee: createFullName(project.manager_details) || "N/A",
    priority: project.priority,
    status: project.project_status,
    dueDate: project.end_date || null,
    type: "project",
    attachments: project.attachments_details || [],
  };
}
