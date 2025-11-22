import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "../../components/auth";
import NotFound from "../not-found";

const Public = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/public/auth" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Public;
