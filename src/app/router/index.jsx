import { createBrowserRouter, Outlet } from "react-router-dom";

import AuthProvider from "../providers/AuthProvider";
import { marketingRoutes } from "./marketing.routes";
import { authRoutes } from "./auth.routes";
import { protectedRoutes } from "./protected.routes";
import { Toaster } from "@/shared/components/ui/sonner";
import { notFound } from "./notfound.routes";
import { Suspense } from "react";
import { Spinner } from "@/shared/components/ui/spinner";

// AuthProvider lives inside the router so it can use navigation hooks. It's wrapped
// by QueryProvider (App.jsx), so the query client is available to it.
const RootLayout = () => (
  <AuthProvider>
    <Toaster
      richColors
      position="top-center"
      closeButton={true}
      toastOptions={{
        classNames: {
          closeButton:
            "right-3! left-auto! top-1/2! [transform:translateY(-50%)]!",
        },
      }}
    />
    <Suspense fallback={<Spinner />}>
      <Outlet />
    </Suspense>
  </AuthProvider>
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [marketingRoutes, authRoutes, protectedRoutes, notFound],
  },
]);
