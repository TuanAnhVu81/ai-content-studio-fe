import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { AuthField } from "@/features/auth/components/AuthField";
import { PasswordField } from "@/features/auth/components/PasswordField";

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export function RegisterForm() {
  const navigate = useNavigate();
  const { setAccessToken, setUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (values) => {
    const payload = {
      full_name: values.full_name,
      email: values.email,
      password: values.password,
    };

    try {
      const registerResponse = await authService.register(payload);
      const accessToken =
        registerResponse?.data?.access_token ??
        registerResponse?.data?.accessToken ??
        registerResponse?.access_token;

      if (accessToken) {
        setAccessToken(accessToken);
      } else {
        const loginResponse = await authService.login({
          email: values.email,
          password: values.password,
        });

        const fallbackToken =
          loginResponse?.data?.access_token ??
          loginResponse?.data?.accessToken ??
          loginResponse?.access_token;

        if (!fallbackToken) {
          throw new Error("Missing access token");
        }

        setAccessToken(fallbackToken);
      }

      const currentUser = await authService.getMe();
      setUser(currentUser);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError("root", {
        message: getApiErrorMessage(error, "Unable to create your account."),
      });
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <AuthField
        id="full_name"
        label="Full name"
        placeholder="Jane Doe"
        autoComplete="name"
        registration={register("full_name")}
        error={errors.full_name?.message}
      />

      <AuthField
        id="email"
        label="Email"
        type="email"
        placeholder="name@company.com"
        autoComplete="email"
        registration={register("email")}
        error={errors.email?.message}
      />

      <PasswordField
        id="password"
        label="Password"
        placeholder="Create a password"
        autoComplete="new-password"
        registration={register("password")}
        error={errors.password?.message}
        helperText="Use at least 8 characters."
      />

      <PasswordField
        id="confirm_password"
        label="Confirm password"
        placeholder="Repeat your password"
        autoComplete="new-password"
        registration={register("confirm_password")}
        error={errors.confirm_password?.message}
      />

      {errors.root?.message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {errors.root.message}
        </div>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{" "}
        <Link className="font-medium text-brand-primary hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
