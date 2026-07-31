import { lazy } from "react";
const History = lazy(()=>import("./pages/History")) ;
const Documents = lazy(()=>import("./pages/Documents")) ;
const Team = lazy(()=>import("./pages/Team")) ;
const Backlog = lazy(() => import("./pages/Backlog"));
const Board = lazy(() => import("./pages/Board"));
const ArtifactList = lazy(() => import("./pages/ArtifactList"));
const ProjectOverview = lazy(() => import("./pages/ProjectOverview"));
const ArtifactDetails = lazy(()=>import("./pages/ArtifactDetails"));
const ProjectReport = lazy(()=>import("./pages/ProjectReport"));
const Timeline = lazy(()=>import("./pages/Timeline"));
const Timelog = lazy(()=>import("./pages/Timelog"));
const ProjectCalendar = lazy(()=>import("./pages/ProjectCalendar"));

export const projectRoutes = [
  {
    index: true,
    element: <ProjectOverview />,
  },
  {
    path: "artifact/:artifactType",
    children: [
      { index: true, element: <ArtifactList /> },
      {
        path: ":artifactId",
        element: <ArtifactDetails />,
      },
    ],
  },
  {
    path: "backlog",
    element: <Backlog />,
  },
  {
    path: "board",
    element: <Board />,
  },
  {
    path:"team",
    element:<Team />
  },
  {
    path: "documents",
    element: <Documents/>,
  },
  {
    path:"history",
    element:<History />
  },
  {
    path:"timeline",
    element:<Timeline />
  },
  {
    path:"timelog",
    element:<Timelog />
  },
  {
    path:"project-report",
    element:<ProjectReport />
  },
  {
    path:"calendar",
    element:<ProjectCalendar />
  }
];
