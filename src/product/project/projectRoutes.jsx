import { lazy } from "react";
const Team = lazy(()=>import("./pages/Team")) ;
const Backlog = lazy(() => import("./pages/Backlog"));
const Board = lazy(() => import("./pages/Board"));
const ArtifactList = lazy(() => import("./pages/ArtifactList"));
const ProjectOverview = lazy(() => import("./pages/ProjectOverview"));
const ArtifactDetails = lazy(()=>import("./pages/ArtifactDetails"))

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
  }
];
