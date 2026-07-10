import { lazy } from "react";

const GuestRoute = lazy(()=>import("@/shared/components/GuestRoute"))
const AuthLayout = lazy(()=>import("../layouts/AuthLayout"))
const Login = lazy(()=>import("@/product/auth/pages/Login"))
const SignUp = lazy(()=>import("@/product/auth/pages/SignUp"))

// GuestRoute redirects already-authenticated users to their dashboard, so the
// login/signup pages are unreachable while signed in (even via direct URL).
export const authRoutes = {
  element: <GuestRoute />,
  children: [
    {
      element: <AuthLayout />,
      children: [
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/signup",
          element: <SignUp />,
        },
      ],
    },
  ],
};
