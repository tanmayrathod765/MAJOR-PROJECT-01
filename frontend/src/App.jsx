import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardLayout from "./layouts/DashboardLayout";
import SessionsRouter from "./pages/SessionsRouter";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import DashboardHome from "./pages/DashboardHome";
import InstitutionSetup from "./pages/InstitutionSetup";

import DrillList from "./pages/DrillList";
import DrillCreate from "./pages/DrillCreate";
import DrillDetail from "./pages/DrillDetail";
import DrillPlay from "./pages/DrillPlay";

import LessonList from "./pages/LessonList";
import LessonDetail from "./pages/LessonDetail";
import LessonCreate from "./pages/LessonCreate";
import QuizManage from "./pages/QuizManage";

import AttemptsRouter from "./pages/AttemptsRouter";
import StudentAttemptsReview from "./pages/StudentAttemptsReview";

import SessionCreate from "./pages/SessionCreate";
import SessionMonitor from "./pages/SessionMonitor";
import VideoLibrary from "./pages/VideoLibrary";
import VideoWatch from "./pages/VideoWatch";
import VideoUpload from "./pages/VideoUpload";
import VideoManagement from "./pages/VideoManagement";
import MyLearning from "./pages/MyLearning";
import ChatAssistant from "./pages/ChatAssistant";
import AlertsPage from "./pages/AlertsPage";
import MockDrillAlertCreate from "./pages/MockDrillAlertCreate";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Dashboard Home */}
              <Route index element={<DashboardHome />} />

              {/* Institution - Admin Only */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["admin"]} />
                }
              >
                <Route
                  path="institution"
                  element={<InstitutionSetup />}
                />
              </Route>

              {/* Drills - All Authenticated Users */}
              <Route
                path="drills"
                element={<DrillList />}
              />

              {/* Teacher/Admin Drill Routes */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "teacher"]}
                  />
                }
              >
                <Route
                  path="drills/new"
                  element={<DrillCreate />}
                />

                <Route
                  path="drills/:id"
                  element={<DrillDetail />}
                />

                {/* Student Attempt Review */}
                <Route
                  path="attempts/student/:studentId"
                  element={<StudentAttemptsReview />}
                />
              </Route>

              {/* Shared Attempts Route */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "student",
                      "teacher",
                      "admin",
                    ]}
                  />
                }
              >
                <Route
                  path="attempts"
                  element={<AttemptsRouter />}
                />
              </Route>

              {/* Sessions List - Student + Teacher/Admin */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "student",
                      "teacher",
                      "admin",
                    ]}
                  />
                }
              >
                <Route
                  path="sessions"
                  element={<SessionsRouter />}
                />
              </Route>

              {/* Teacher/Admin Session Management */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["teacher", "admin"]}
                  />
                }
              >
                <Route
                  path="sessions/new"
                  element={<SessionCreate />}
                />

                <Route
                  path="sessions/:id"
                  element={<SessionMonitor />}
                />
              </Route>

              {/* Curriculum - All Authenticated Users */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "student",
                      "teacher",
                      "admin",
                    ]}
                  />
                }
              >
                <Route
                  path="lessons"
                  element={<LessonList />}
                />

                <Route
                  path="lessons/:id"
                  element={<LessonDetail />}
                />
              </Route>

              {/* Video Learning - All Authenticated Users */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["student", "teacher", "admin"]}
                  />
                }
              >
                <Route path="videos" element={<VideoLibrary />} />
                <Route path="videos/:id" element={<VideoWatch />} />
              </Route>

              {/* Student Video Progress */}
              <Route
                element={<ProtectedRoute allowedRoles={["student"]} />}
              >
                <Route path="my-learning" element={<MyLearning />} />
              </Route>

              {/* Video Management */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]} />
                }
              >
                <Route path="videos/new" element={<VideoUpload />} />
                <Route path="videos/edit/:id" element={<VideoUpload />} />
                <Route path="videos/manage" element={<VideoManagement />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["student", "teacher", "admin"]}
                  />
                }
              >
                <Route path="assistant" element={<ChatAssistant />} />
                <Route path="alerts" element={<AlertsPage />} />
              </Route>

              <Route
                element={<ProtectedRoute allowedRoles={["teacher", "admin"]} />}
              >
                <Route path="alerts/mock-drill" element={<MockDrillAlertCreate />} />
              </Route>

              {/* Curriculum Management - Teacher/Admin */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["teacher", "admin"]}
                  />
                }
              >
                <Route
                  path="lessons/new"
                  element={<LessonCreate />}
                />

                <Route
                  path="lessons/:id/quiz"
                  element={<QuizManage />}
                />
              </Route>

              {/* Student-Only Drill Play */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["student"]}
                  />
                }
              >
                <Route
                  path="drills/:id/play"
                  element={<DrillPlay />}
                />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={<Login />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;