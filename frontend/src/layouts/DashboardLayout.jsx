import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AlertBanner from "../components/AlertBanner";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    end: true,
    show: true,
  },
  {
    label: "Institution",
    to: "/dashboard/institution",
    show: user?.role === "admin",
  },
  {
    label: "Drills",
    to: "/dashboard/drills",
    show: true,
  },
  {
    label: "Sessions",
    to: "/dashboard/sessions",
    show: user?.role === "teacher" || user?.role === "admin",
  },

  {
  label: "Class Sessions",
  to: "/dashboard/sessions",
  show: user?.role === "student",
},

  {
    label: "Attempts",
    to: "/dashboard/attempts",
    show: user?.role === "teacher" || user?.role === "admin",
  },
  {
    label: "My Attempts",
    to: "/dashboard/attempts",
    show: user?.role === "student",
  },
  {
  label: "Curriculum",
  to: "/dashboard/lessons",
  show:
    user?.role === "student" ||
    user?.role === "teacher" ||
    user?.role === "admin",
},
  {
    label: "Video Learning",
    to: "/dashboard/videos",
    show: true,
  },
  {
    label: "My Learning",
    to: "/dashboard/my-learning",
    show: user?.role === "student",
  },
  {
    label: "Upload Video",
    to: "/dashboard/videos/new",
    show: user?.role === "teacher" || user?.role === "admin",
  },
  {
    label: "Video Management",
    to: "/dashboard/videos/manage",
    show: user?.role === "teacher" || user?.role === "admin",
  },
  {
    label: "AI Safety Assistant",
    to: "/dashboard/assistant",
    show: true,
  },
  {
    label: "Disaster Alerts",
    to: "/dashboard/alerts",
    show: true,
  },
  {
    label: "Create Mock Drill",
    to: "/dashboard/alerts/mock-drill",
    show: user?.role === "teacher" || user?.role === "admin",
  },
];
  const handleLogout = () => {
    setSidebarOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-blue-950 text-white shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-blue-900 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue-950">
            DR
          </div>

          <div className="ml-3">
            <h1 className="font-bold">DisasterReady</h1>
            <p className="text-xs text-blue-200">Safety Education</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-blue-950"
                      : "text-blue-100 hover:bg-blue-900 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-blue-900 p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-blue-100 transition hover:bg-red-600 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="hidden lg:block">
            <h2 className="font-semibold text-slate-800">
              DisasterReady Dashboard
            </h2>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name}
              </p>
              <p className="text-xs capitalize text-slate-500">
                {user?.role}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <span className="hidden rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-900 sm:inline-block">
              {user?.role}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <AlertBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;