import loginScreenImage from "@/assets/images/login-screen-image.png";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import PasswordLoginForm from "../components/PasswordLoginForm";
import OtpLoginForm from "../components/OtpLoginForm";

const Login = () => {
  const [loginMethod, setLoginMethod] = useState("password");

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-white shadow-lg rounded-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden h-150">
        {/* Left Image */}
        <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center">
          <img
            src={loginScreenImage}
            alt="Login Illustration"
            className="max-w-sm w-full"
          />
        </div>

        {/* Right Form */}
        <div className="flex md:w-1/2 flex-col gap-1 justify-center items-center">
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            <NavLink to={-1}>
              <ArrowLeft />
            </NavLink>{" "}
            Welcome Back!
          </h1>

          <p className="text-gray-500 text-sm">
            Sign in to you management account
          </p>
          <div className="w-full max-w-105 my-3">
            {loginMethod === "password" ? (
              <PasswordLoginForm handleModeChange={() => setLoginMethod("otp")} />
            ) : (
              <OtpLoginForm handleModeChange={() => setLoginMethod("password")} />
            )}
          </div>

          <div className="text-sm">
            Don't have an account?{" "}
            <NavLink to={"/signup"} className={"text-blue-600 hover:underline"}>
              Sign Up
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

{
  /* <form
          // onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="w-full md:w-1/2 flex flex-col justify-center p-8 sm:m-2"
        >
          <div className="flex justify-center items-center mb-2 gap-2">
            <NavLink to={-1} className="cursor-pointer">
              <ArrowLeft size={18} />
            </NavLink>
            <h2 className="text-2xl font-bold text-black text-center">
              Welcome Back!
            </h2>
          </div>
          <p className="text-gray-500 mb-6 text-center">
            Sign in to your management account
          </p> */
}

{
  /* Email */
}
{
  /* <div className="mb-4">
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </div> */
}

{
  /* Password */
}
{
  /* {!isOtpLogin && (
            <div className="mb-4">
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                      >
                        {showPassword ? (
                          <TbEyeClosed size={20} />
                        ) : (
                          <AiOutlineEye size={20} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          )} */
}

{
  /* Links */
}
{
  /* <div className="flex items-center justify-between mb-6 text-sm">
            <button
              type="button"
              className="text-blue-600 hover:underline"
               onClick={handleToggleMode}

            >
              Login with  */
}
{
  /* {isOtpLogin ? "Password" : "OTP"} */
}
{
  /* </button> */
}

{
  /* {!isOtpLogin && ( */
}
{
  /* <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button> */
}
{
  /* )} */
}
{
  /* </div> */
}

{
  /* Form-level error */
}
{
  /* {errors.root && (
            <p className="text-sm text-red-500 mb-3 text-center">
              {errors.root.message}
            </p>
          )} */
}

{
  /* Submit */
}
{
  /* <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="transition"
          >
            {isLoading
              ? isOtpLogin
                ? "Sending OTP..."
                : "Signing in..."
              : isOtpLogin
                ? "Send OTP"
                : "Sign In"}
          </Button> */
}

{
  /* <div className="flex justify-center gap-2 items-center text-sm mt-4">
            Don't have an account?
            <NavLink
              to="/register-account"
              className="underline text-blue-500"
              // disabled={isLoading}
            >
              Sign Up
            </NavLink>
          </div>

          <NavLink
            to="/"
            className="flex gap-1 items-center text-sm mt-3 text-blue-500 underline justify-center"
          >
            <ArrowLeft size={15} /> Back to Home
          </NavLink>
        </form> */
}
