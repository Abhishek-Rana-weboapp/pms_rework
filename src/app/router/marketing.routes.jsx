import TestReports from "@/product/reports/TestReports";
import Homepage from "../../marketing/pages/Homepage";
import MarketingLayout from "../layouts/MarketingLayout";

export const marketingRoutes ={
    path:"/",
    element : <MarketingLayout />,
    children:[
        {
            index:true,
            element:<Homepage />
        },
        {
            path:"testpath",
            element:<TestReports />
        }
    ]
}