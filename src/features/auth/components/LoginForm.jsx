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

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm({ redirectTo = "/dashboard" }) {
  const navigate = useNavigate();
  const { setAccessToken, setUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const loginResponse = await authService.login(values);
      const accessToken =
        loginResponse?.data?.access_token ??
        loginResponse?.data?.accessToken ??
        loginResponse?.access_token;

      if (!accessToken) {
        throw new Error("Missing access token");
      }

      setAccessToken(accessToken);

      let currentUser;

      try {
        currentUser = await authService.getMe();
      } catch (error) {
        throw new Error(
          getApiErrorMessage(
            error,
            "Signed in, but failed to load your profile from /auth/me."
          )
        );
      }

      setUser(currentUser);

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError("root", {
        message: getApiErrorMessage(error, error.message || "Unable to sign in. Please try again."),
      });
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
        placeholder="Enter your password"
        autoComplete="current-password"
        registration={register("password")}
        error={errors.password?.message}
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
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-sm text-slate-600 dark:text-slate-300">
        New to the studio?{" "}
        <Link className="font-medium text-brand-primary hover:underline" to="/register">
          Create an account
        </Link>
      </p>
    </form>
  );
}
