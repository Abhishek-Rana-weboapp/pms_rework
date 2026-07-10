import { lazy } from "react";
const ArtifactList = lazy(()=>import("./pages/ArtifactList"));
const ProjectOverview = lazy(()=>import("./pages/ProjectOverview"));


export const projectRoutes =[
     {
        index:true,
        element:<ProjectOverview />
     }, 
     {
        path:"artifact/:artifactType",
        element:<ArtifactList />
     },
     {
        path:"backlog",
        element:<div>backlog</div>
     }
]