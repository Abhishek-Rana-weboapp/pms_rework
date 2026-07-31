import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import DocumentsArtifactSection from "../components/DocumentsArtifactSection";
import DocumentsProjectSection from "../components/DocumentsProjectSection";

const Documents = () => {
  const [activeTab, setActiveTab] = useState({
    type: "project",
    value: "main-project",
  });

  const handleChange = (value) => {
    if (value === "main-project") {
      setActiveTab({
        type: "project",
        value: "main-project",
      });
    } else {
      setActiveTab({
        type: "artifact",
        value,
      });
    }
  };

  return (
    // Fill the ProjectLayout content pane and pin scrolling to the list /
    // preview columns — the page itself must not grow past the viewport.
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden max-sm:gap-2 sm:gap-4">

        <SectionWrapper className={"space-y-2"}>
          <div className="flex items-center justify-between px-2">
            <h3 className="font-semibold">Documents</h3>
          </div>
          
                <Tabs
          value={activeTab.value}
          onValueChange={handleChange}
          className="shrink-0"
          >
          <TabsList className="flex items-center gap-2">
            <TabsTrigger value="main-project">Main Project</TabsTrigger>
            <TabsTrigger value="epic">Epics</TabsTrigger>
            <TabsTrigger value="user_story">Stories</TabsTrigger>
            <TabsTrigger value="task">Tasks</TabsTrigger>
            <TabsTrigger value="spike">Spikes</TabsTrigger>
            <TabsTrigger value="issue">Issues</TabsTrigger>
            <TabsTrigger value="test">Tests</TabsTrigger>
          </TabsList>
                </Tabs>
        </SectionWrapper>

      <SectionWrapper className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab.type === "project" ? (
          <DocumentsProjectSection />
        ) : (
          // Keyed by tab: switching artifact type drops the previous tab's
          // selection, search term and page instead of carrying them over.
          <DocumentsArtifactSection
            key={activeTab.value}
            type={activeTab.value}
          />
        )}
      </SectionWrapper>
    </div>
  );
};

export default Documents;
