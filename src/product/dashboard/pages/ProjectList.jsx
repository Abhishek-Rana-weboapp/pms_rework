import { useState } from "react";
import { useProjects } from "../api/queries";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Grid, Plus, Table2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider, // 1. Added missing TooltipProvider
} from "@/shared/components/ui/tooltip";
import { Button } from "@/shared/components/ui/button";
import ProjectGridView from "../components/views/ProjectGridView";
import ProjectTableView from "../components/views/ProjectTableView";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { useProjectFormDialog } from "@/product/project/context/projectFormDialogStore";
import PageLoader from "@/shared/components/layout/PageLoader";
import { PaginationControls } from "@/shared/components/PaginationControls";
import { PageSizeSelect } from "@/shared/components/PageSizeSelect";

const ProjectList = () => {
  const navigate = useNavigate();
  const [dataView, setDataView] = useLocalStorage("projectView", "card");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data = {}, isLoading } = useProjects({ page, page_size: pageSize });

  const projects = data?.results || [];
  const pagination = data?.pagination || {};

  const handleClick = (project) => {
    navigate(`${project.id}`);
  };

  // A bigger/smaller page changes what "page 1" contains, so jump back to it.
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    // 2. Wrap your view inside the provider so all child tooltips initialize perfectly
    <TooltipProvider delayDuration={200}>
      <div className="p-4">
        <ProjectListHeader
          dataView={dataView}
          projectCount={pagination?.count ?? projects?.length}
          setDataView={setDataView}
        />
        {/* Render views dynamically based on the dataView state selection */}
        {isLoading ? (
          <PageLoader />
        ) : (
          <main className="mt-6 flex flex-col gap-6">
            {dataView === "table" ? (
              <div className="">
                <ProjectTableView
                  onRowClick={handleClick}
                  projects={projects}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <ProjectGridView onClick={handleClick} projects={projects} />
            )}

            {/* Server-driven pagination, shared by both the grid and table views. */}
            <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
              <PageSizeSelect
                pageSize={pagination?.page_size ?? pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
              <PaginationControls
                page={pagination?.page ?? page}
                pageCount={pagination?.total_pages ?? 1}
                onPageChange={setPage}
                className="mx-0 w-auto"
              />
            </div>
          </main>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ProjectList;

const ProjectListHeader = ({ projectCount = 0, dataView, setDataView }) => {
  const { openAdd } = useProjectFormDialog();
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex flex-col">
        <h1 className="text-xl font-medium">Projects</h1>
        <p className="text-sm text-muted-foreground">
          <span className="text-green-600">{projectCount}</span> active projects
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-max">
          <Tabs value={dataView} onValueChange={setDataView}>
            <TabsList className="bg-gray-200">
              {/* TooltipTrigger uses asChild to become the TabsTrigger's interior layout */}
              <TabsTrigger value="card" className="p-0">
                <Tooltip delayDuration={600}>
                  <TooltipTrigger asChild>
                    <div className="p-2 w-full h-full flex items-center justify-center">
                      <Grid className="h-4 w-4" />
                      <span className="sr-only">Card View</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    <p>Card View</p>
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>

              {/* 1. Table View Tab (TabsTrigger is now on the OUTSIDE) */}
              <TabsTrigger value="table" className="p-0">
                <Tooltip delayDuration={600}>
                  <TooltipTrigger asChild>
                    <div className="p-2 w-full h-full flex items-center justify-center">
                      <Table2 className="h-4 w-4" />
                      <span className="sr-only">Table View</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    <p>Table View</p>
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>

              {/* 2. Card View Tab */}
            </TabsList>
          </Tabs>
        </div>

        <Button onClick={openAdd} className="flex gap-1 items-center">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>
    </div>
  );
};
