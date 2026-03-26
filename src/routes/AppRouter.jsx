import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppSpinner } from "@/components/common/AppSpinner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { AdminCampaignsPage } from "@/features/admin/pages/AdminCampaignsPage";
import { AdminContentsPage } from "@/features/admin/pages/AdminContentsPage";
import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";
import { ChangePasswordPage } from "@/features/auth/pages/ChangePasswordPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { CampaignDetailPage } from "@/features/campaign/pages/CampaignDetailPage";
import { CampaignListPage } from "@/features/campaign/pages/CampaignListPage";
import { UserDashboardPage } from "@/features/dashboard/pages/UserDashboardPage";
import { LandingPage } from "@/features/landing/pages/LandingPage";
import { AdminRoute } from "@/routes/AdminRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

const ContentListPage = lazy(() =>
  import("@/features/content/pages/ContentListPage").then((module) => ({
    default: module.ContentListPage,
  }))
);

const EditorPage = lazy(() =>
  import("@/features/content/pages/EditorPage").then((module) => ({
    default: module.EditorPage,
  }))
);

export function AppRouter() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/campaigns" element={<CampaignListPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            <Route
              path="/contents"
              element={
                <Suspense fallback={<AppSpinner label="Loading content workspace..." />}>
                  <ContentListPage />
                </Suspense>
              }
            />
            <Route
              path="/editor/:id"
              element={
                <Suspense fallback={<AppSpinner label="Loading editor..." />}>
                  <EditorPage />
                </Suspense>
              }
            />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/campaigns" element={<AdminCampaignsPage />} />
            <Route path="/admin/contents" element={<AdminContentsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
