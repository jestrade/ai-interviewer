import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ReactNode } from "react";
import Auth from "@/components/auth/auth";
import Feedback from "@/components/feedback/feedback";
import { useAuth } from "@/contexts/auth/hooks";
import NotFound from "../not-found";
import Private from "../private/private";

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const Root = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Private /> : <Auth />} />
        <Route
          path="/feedback"
          element={
            <RequireAuth>
              <Feedback />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
