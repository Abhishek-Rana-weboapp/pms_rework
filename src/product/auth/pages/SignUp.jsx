import SignUpImage from "@/assets/images/sign-up-img.png";
import SignUpForm from "../components/SignUpForm";
import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SignUp = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-white flex shadow-lg rounded-2xl flex-col md:flex-row w-full max-w-5xl min-h-150">
        {/* Left Image */}
        <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center">
          <img
            src={SignUpImage}
            alt="Login Illustration"
            className="max-w-sm w-full"
          />
        </div>

        {/* Right Form */}
        <div className="flex md:w-1/2 flex-col gap-1 justify-center items-center p-5">
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            <NavLink to={-1}>
              <ArrowLeft className="size-5" />
            </NavLink>{" "}
            Welcome!
          </h1>

          <p className="text-sm text-gray-500 mb-4">
            Set up you management account
          </p>
          <div className="w-full max-w-105">
            <SignUpForm />
          </div>

          <p className="text-sm mt-4">
            Already have an account?{" "}
            <NavLink className={"text-blue-600"} to={"/login"}>
              Sign In
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
