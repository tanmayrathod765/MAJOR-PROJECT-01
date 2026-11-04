import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import StudentSessions from "./StudentSessions";
import SessionList from "./SessionList";

const SessionsRouter = () => {
  const { user } = useAuth();

  if (user?.role === "student") {
    return <StudentSessions />;
  }

  if (user?.role === "teacher" || user?.role === "admin") {
    return <SessionList />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default SessionsRouter;