import { BrowserRouter, Routes, Route } from "react-router-dom";
import Public from "../public";
import Private from "../private";
import NotFound from "../not-found";
import { initSentry } from "@/services/sentry";
import { useAuth } from "@/contexts/auth/hooks";

initSentry();

const Root = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Private /> : <Public />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
