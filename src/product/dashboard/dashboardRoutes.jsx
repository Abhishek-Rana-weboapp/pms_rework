import { lazy } from "react";

const DashboardLayout = lazy(()=>import("@/app/layouts/DashboardLayout"));
const Dashboard = lazy(()=>import("./pages/Dashboard"));
const EmployeeList = lazy(()=>import("./pages/EmployeeList"));
const ClientList = lazy(()=>import("./pages/ClientList"));
const PersonDetails = lazy(()=>import("./pages/PersonDetails"));
const ProjectList = lazy(()=>import("./pages/ProjectList"));
const AllReports = lazy(()=>import("./pages/AllReports"));
const ProjectLayout =  lazy(()=>import("@/app/layouts/ProjectLayout"));
import { projectRoutes } from "../project/projectRoutes";
import { notFound } from "@/app/router/notfound.routes";

export const dashboardRoutes = [
    {
        element:<DashboardLayout />,
        children:[
            {
                index:true,
                element:<Dashboard />
            },
            {
                path:"employees",
                children:[
                    { index:true, element:<EmployeeList/> },
                    { path:":employeeId", element:<PersonDetails/> },
                ]
            },
            {
                path:"clients",
                children:[
                    { index:true, element:<ClientList/> },
                    { path:":clientId", element:<PersonDetails/> },
                ]
            },
            {
                path:"projects",
                children: [
                    {
                        index:true,
                        element:<ProjectList/>
                    },
                    {
                        path:":projectId",
                        element:<ProjectLayout />,
                        children:[
                            ...projectRoutes
                            // project detail tab routes go here, e.g.
                            // { index:true, element:<ProjectOverview/> },
                            // { path:"tasks", element:<ProjectTasks/> },
                        ]
                    }
                ]
            },
            {
                path:"reports",
                element:<AllReports/>
            },

            notFound

        ]
    }
]
