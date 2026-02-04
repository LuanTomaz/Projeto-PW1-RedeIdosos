import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/UsersPage";
import EldersPage from "./pages/EldersPage";
import VolunteersPage from "./pages/VolunteersPage";
import CompanionshipsPage from "./pages/CompanionshipsPage";
import MapPage from "./pages/MapPage";
import ReviewsPage from "./pages/ReviewsPage";
import OngsPage from "./pages/OngsPage";
import VerificationsPage from "./pages/VerificationsPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import Onboarding from "./pages/Onboarding";
import PendingApproval from "./pages/PendingApproval";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/elders" element={
              <ProtectedRoute allowedRoles={['admin', 'ong']}>
                <DashboardLayout>
                  <EldersPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ongs" element={
              <ProtectedRoute allowedRoles={['admin', 'ong']}>
                <DashboardLayout>
                  <OngsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/volunteers" element={
              <ProtectedRoute allowedRoles={['admin', 'ong']}>
                <DashboardLayout>
                  <VolunteersPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/companionships" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CompanionshipsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/my-requests" element={
              <ProtectedRoute allowedRoles={['idoso']}>
                <DashboardLayout>
                  <CompanionshipsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/my-activities" element={
              <ProtectedRoute allowedRoles={['voluntario']}>
                <DashboardLayout>
                  <CompanionshipsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/new-request" element={
              <ProtectedRoute allowedRoles={['idoso']}>
                <DashboardLayout>
                  <CompanionshipsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/map" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MapPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/reviews" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ReviewsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/verifications" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <VerificationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/reports" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/onboarding" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Onboarding />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/pending" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PendingApproval />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
