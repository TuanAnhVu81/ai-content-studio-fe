import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { AdminCampaignsPage } from "@/features/admin/pages/AdminCampaignsPage";
import { AdminContentsPage } from "@/features/admin/pages/AdminContentsPage";
import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { CampaignDetailPage } from "@/features/campaign/pages/CampaignDetailPage";
import { CampaignListPage } from "@/features/campaign/pages/CampaignListPage";
import { EditorPage } from "@/features/content/pages/EditorPage";
import { UserDashboardPage } from "@/features/dashboard/pages/UserDashboardPage";
import { LandingPage } from "@/features/landing/pages/LandingPage";
import { AdminRoute } from "@/routes/AdminRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

export function AppRouter() {
  return (
    <BrowserRouter>
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
            <Route path="/editor/:id" element={<EditorPage />} />
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
