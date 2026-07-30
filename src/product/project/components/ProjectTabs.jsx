import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useProjectTabOrder } from "../hooks/useProjectTabOrder";
import ProjectTabsCustomizeMenu from "./ProjectTabsCustomizeMenu";

const ProjectTabs = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { orgUuid, projectId } = useParams();

  // Order is a saved preference, not a constant. The active tab still comes from
  // the URL and each trigger is keyed by its route, so reordering is purely
  // presentational — it can't affect which tab is selected.
  const { tabs, isCustomized, setOrder, resetOrder } = useProjectTabOrder();

  // Every `to` in projectTabsData is relative to the project root, so derive the
  // active tab by stripping that base off the current path. Overview is "".
  // Detail routes (e.g. artifact/epic/:id) should still highlight the parent tab.
  const base = `/${orgUuid}/projects/${projectId}`;
  const relative = pathname.startsWith(base)
    ? pathname.slice(base.length).replace(/^\/+/, "")
    : "";
  const currentTab =
    tabs.find((tab) =>
      tab.to === ""
        ? relative === ""
        : relative === tab.to || relative.startsWith(`${tab.to}/`),
    )?.to ?? relative;

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden no-scrollbar">
        <Tabs
          value={currentTab}
          onValueChange={(to) => navigate(to ? `${base}/${to}` : base)}
        >
          <TabsList variant="line" className="w-max">
            {tabs.map((tab) => (
              <TabsTrigger
                onMouseEnter={tab.prefetch}
                className={"cursor-pointer capitalize"}
                key={tab.id}
                value={tab.to}
              >
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ProjectTabsCustomizeMenu
        tabs={tabs}
        isCustomized={isCustomized}
        onOrderChange={setOrder}
        onReset={resetOrder}
      />
    </div>
  );
};

export default ProjectTabs;
