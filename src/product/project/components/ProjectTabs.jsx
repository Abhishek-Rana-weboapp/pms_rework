import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useProjectTabPreferences } from "../hooks/useProjectTabPreferences";
import ProjectTabsCustomizeMenu from "./ProjectTabsCustomizeMenu";

const ProjectTabs = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { orgUuid, projectId } = useParams();

  // Order + visibility are saved preferences, not constants. The active tab
  // still comes from the URL; reordering/hiding is purely presentational.
  const {
    tabs,
    menuTabs,
    isCustomized,
    setOrder,
    setTabVisible,
    reset,
  } = useProjectTabPreferences();


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

  // If the user hid the tab they're currently on, land on the first visible one
  // instead of leaving them on a route with no matching strip item.
  useEffect(() => {
    if (tabs.length === 0) return;
    const stillVisible = tabs.some((tab) =>
      tab.to === ""
        ? relative === ""
        : relative === tab.to || relative.startsWith(`${tab.to}/`),
    );
    if (stillVisible) return;
    const fallback = tabs[0];
    navigate(fallback.to ? `${base}/${fallback.to}` : base, { replace: true });
  }, [tabs, relative, base, navigate]);

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden no-scrollbar">
        <Tabs
          value={currentTab}
          activationMode="manual"
          onValueChange={(to) => navigate(to ? `${base}/${to}` : base)}
        >
          <TabsList variant="line" className="w-max">
            {tabs.map((tab) => (
              <TabsTrigger
                onMouseEnter={tab.prefetch}
                className="cursor-pointer capitalize"
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
        tabs={menuTabs}
        isCustomized={isCustomized}
        onOrderChange={setOrder}
        onVisibilityChange={setTabVisible}
        onReset={reset}
      />
    </div>
  );
};

export default ProjectTabs;
