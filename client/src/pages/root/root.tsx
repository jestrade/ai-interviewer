import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ReactNode } from "react";
import Auth from "@/components/auth/auth";
import Feedback from "@/components/feedback/feedback";
import { useAuth } from "@/contexts/auth/hooks";
import Admin from "../admin/admin";
import AdminLogin from "../admin/admin-login";
import NotFound from "../not-found";
import Private from "../private/private";

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  return user?.isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

const Home = () => {
  const { user } = useAuth();
  if (!user) return <Auth />;
  // An admin signed in through the admin console has no interview role.
  if (!user.role && user.isAdmin) return <Navigate to="/admin" replace />;
  return <Private />;
};

const AdminEntry = () => {
  const { user } = useAuth();
  return user?.isAdmin ? <Navigate to="/admin" replace /> : <AdminLogin />;
};

const Root = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/feedback" element={<RequireAuth><Feedback /></RequireAuth>} />
      <Route path="/admin/login" element={<AdminEntry />} />
      <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default Root;
