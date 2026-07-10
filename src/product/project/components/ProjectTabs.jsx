import { projectTabsData } from "../config/ProjectTabsData";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const ProjectTabs = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { orgUuid, projectId } = useParams();

  // Every `to` in projectTabsData is relative to the project root, so derive the
  // active tab by stripping that base off the current path. Overview is "".
  const base = `/${orgUuid}/projects/${projectId}`;
  const currentTab = pathname.startsWith(base)
    ? pathname.slice(base.length).replace(/^\/+/, "")
    : "";

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar">
      <Tabs
        value={currentTab}
        onValueChange={(to) => navigate(to ? `${base}/${to}` : base)}
      >
        <TabsList variant="line" className="w-max">
          {projectTabsData.map((tab) => (
            <TabsTrigger key={tab.to} value={tab.to}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ProjectTabs;
