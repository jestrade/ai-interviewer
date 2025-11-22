import { Routes, Route } from "react-router-dom";
import Auth from "../../components/auth";

const Public = () => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
    </Routes>
  );
};

export default Public;
