import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import OtpVerificationPage from "./pages/auth/OtpVerificationPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import HomeSection from "./pages/dashboard/HomeSection";
import FormBuilderSection from "./pages/dashboard/FormBuilderSection";
import RecentWorkSection from "./pages/dashboard/RecentWorkSection";
import SharedContentSection from "./pages/dashboard/SharedContentSection";
import AnalysisSection from "./pages/dashboard/AnalysisSection";
import QuestionAnalysisPage from "./pages/dashboard/QuestionAnalysisPage";
import ProjectsSection from "./pages/dashboard/ProjectsSection";
import ProfileSection from "./pages/dashboard/ProfileSection";
import RespondFormPage from "./pages/respond/RespondFormPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<OtpVerificationPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/respond/:slug" element={<RespondFormPage />} />

      <Route
        path="/dashboard/form-builder"
        element={
          <ProtectedRoute>
            <FormBuilderSection />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <ProfileSection />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeSection />} />
        <Route path="home" element={<HomeSection />} />
        <Route path="recent" element={<RecentWorkSection />} />
        <Route path="shared" element={<SharedContentSection />} />
        <Route path="analysis" element={<AnalysisSection />} />
        <Route path="analysis/:formId" element={<QuestionAnalysisPage />} />
        <Route path="projects" element={<ProjectsSection />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <div className="app-root">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  );
}

export default App;
