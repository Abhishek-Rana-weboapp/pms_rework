import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { useNavigate, useSearchParams } from "react-router-dom";
import loginScreenImage from "@/assets/images/login-screen-image.png";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetPassword } from "../api/authMutations";
import { toast } from "sonner";
import { getSetPasswordErrorMessage } from "@/shared/lib/authHelpers";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
        },
      ),
    confirm_password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const { mutate: setPassword, isPending } = useSetPassword();

  const onSubmit = (data) => {
    setPassword(
      {
        password: data.password,
        confirm_password: data.confirm_password,
        email,
        token,
      },
      {
        onSuccess: () => {
          toast.success("Password set successfully");
          navigate("/login");
        },
        onError: (error) => {
          toast.error(getSetPasswordErrorMessage(error));
        },
      },
    );
  };

  if (!email || !token) {
    return (
      <div className="h-dvh flex items-center justify-center text-center text-2xl font-bold">
        Invalid Link. Please try again.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-2">
      <SectionWrapper className="flex items-center justify-center md:flex-row flex-col gap-4 w-full max-w-5xl overflow-hidden h-150">
        <div className="md:block hidden">
          <img
            src={loginScreenImage}
            alt="Login Screen Image"
            className="max-w-lg w-full"
          />
        </div>
        <div className="space-y-4 md:flex-1 w-full md:max-w-sm max-w-[80vw] mx-auto">
          <div className="space-y-2">
              <h1 className="text-2xl font-bold text-center">Set Password</h1>
              <p className="text-sm text-gray-500 text-center">
                Please enter your new password.
              </p>
          </div>
          <form
            className="flex flex-col gap-4 w-full md:max-w-sm max-w-[90vw] mx-auto"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FieldGroup className="grid grid-cols-1 gap-4">
              <Field
                className="col-span-2 gap-2"
                data-invalid={!!errors.password}
              >
                <FieldLabel>New Password</FieldLabel>
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="New Password"
                  className="w-full p-3"
                  autoFocus
                />
                <FieldError>{errors.password?.message}</FieldError>
              </Field>
              <Field
                className="col-span-2 gap-2"
                data-invalid={!!errors.confirm_password}
              >
                <FieldLabel>Confirm Password</FieldLabel>
                <Input
                  {...register("confirm_password")}
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full p-3"
                />
                <FieldError>{errors.confirm_password?.message}</FieldError>
              </Field>
            </FieldGroup>
            <Button type="submit">Set Password</Button>
          </form>
        </div>
      </SectionWrapper>
    </div>
  );
};

export default SetPassword;
