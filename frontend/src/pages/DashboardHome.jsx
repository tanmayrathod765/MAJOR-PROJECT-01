import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyInstitution } from "../api/institutionApi";

const DashboardHome = () => {
  const { user } = useAuth();

  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstitution = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const response = await getMyInstitution();

        if (response.success) {
          setInstitution(response.institution);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load institution information."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInstitution();
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Welcome */}
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-800">
          Welcome back
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Hello, {user?.name}
        </h1>

        <p className="mt-2 text-slate-500">
          You are signed in as a{" "}
          <span className="font-semibold capitalize text-blue-900">
            {user?.role}
          </span>
          .
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="animate-pulse">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="mt-4 h-8 w-64 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-48 rounded bg-slate-200" />
          </div>
        </div>
      )}

      {/* Admin with no institution */}
      {!loading && user?.role === "admin" && notFound && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
              Institution setup required
            </span>

            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              Set up your institution
            </h2>

            <p className="mt-2 text-slate-600">
              Add your school's or college's details so DisasterReady
              can organize your institution's disaster preparedness
              activities.
            </p>

            <Link
              to="/dashboard/institution"
              className="mt-6 inline-flex rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Set up your institution
            </Link>
          </div>
        </div>
      )}

      {/* Institution summary */}
      {!loading && institution && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Your Institution
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {institution.name}
              </h2>

              <p className="mt-2 capitalize text-slate-500">
                {institution.type}
              </p>
            </div>

            {user?.role === "admin" && (
              <Link
                to="/dashboard/institution"
                className="rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50"
              >
                Manage Institution
              </Link>
            )}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500">Location</p>
            <p className="mt-1 font-medium text-slate-800">
              {institution.city}, {institution.state}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;