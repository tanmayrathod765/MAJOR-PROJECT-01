import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import MyAttempts from "./MyAttempts";
import TeacherAttempts from "./TeacherAttempts";

const AttemptsRouter = () => {
  const { user } = useAuth();

  if (user?.role === "student") {
    return <MyAttempts />;
  }

  if (user?.role === "teacher" || user?.role === "admin") {
    return <TeacherAttempts />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default AttemptsRouter;