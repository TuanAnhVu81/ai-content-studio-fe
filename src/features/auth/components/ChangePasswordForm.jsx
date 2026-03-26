import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { PasswordField } from "@/features/auth/components/PasswordField";

const changePasswordSchema = z
  .object({
    old_password: z.string().min(8, "Current password must be at least 8 characters"),
    new_password: z.string().min(8, "New password must be at least 8 characters"),
    confirm_new_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    path: ["confirm_new_password"],
    message: "Passwords do not match",
  });

export function ChangePasswordForm() {
  const navigate = useNavigate();
  const { clearAuth } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      setSuccessMessage("");
      await authService.changePassword(values);
      reset();
      clearAuth();
      setSuccessMessage("Password updated successfully. Please sign in again.");
      navigate("/login", { replace: true });
    } catch (error) {
      setError("root", {
        message: getApiErrorMessage(error, "Unable to update your password."),
      });
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <PasswordField
        id="old_password"
        label="Current password"
        placeholder="Enter your current password"
        autoComplete="current-password"
        registration={register("old_password")}
        error={errors.old_password?.message}
      />

      <PasswordField
        id="new_password"
        label="New password"
        placeholder="Create a new password"
        autoComplete="new-password"
        registration={register("new_password")}
        error={errors.new_password?.message}
      />

      <PasswordField
        id="confirm_new_password"
        label="Confirm new password"
        placeholder="Repeat your new password"
        autoComplete="new-password"
        registration={register("confirm_new_password")}
        error={errors.confirm_new_password?.message}
      />

      {errors.root?.message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {errors.root.message}
        </div>
      ) : null}

      {successMessage ? (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="size-4" />
          {successMessage}
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
            Updating password...
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}
