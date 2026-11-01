import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="text-center">
        <div className="mb-4 text-6xl font-bold text-blue-900">
          403
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Access Denied
        </h1>

        <p className="mt-2 text-slate-500">
          You don't have access to this page.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;