import { projectTabsData } from "../config/ProjectTabsData";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const ProjectTabs = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { orgUuid, projectId } = useParams();

  // Every `to` in projectTabsData is relative to the project root, so derive the
  // active tab by stripping that base off the current path. Overview is "".
  // Detail routes (e.g. artifact/epic/:id) should still highlight the parent tab.
  const base = `/${orgUuid}/projects/${projectId}`;
  const relative = pathname.startsWith(base)
    ? pathname.slice(base.length).replace(/^\/+/, "")
    : "";
  const currentTab =
    projectTabsData.find((tab) =>
      tab.to === ""
        ? relative === ""
        : relative === tab.to || relative.startsWith(`${tab.to}/`),
    )?.to ?? relative;

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar">
      <Tabs
        value={currentTab}
        onValueChange={(to) => navigate(to ? `${base}/${to}` : base)}
      >
        <TabsList variant="line" className="w-max">
          {projectTabsData.map((tab) => (
            <TabsTrigger
              onMouseEnter={tab.prefetch}
              className={"cursor-pointer capitalize"}
              key={tab.to}
              value={tab.to}
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ProjectTabs;
