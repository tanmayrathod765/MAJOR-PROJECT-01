import { useEffect, useState } from "react";
import { getAlertStatus, getAlerts } from "../api/alertApi";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [alertResult, statusResult] = await Promise.all([getAlerts(), getAlertStatus()]);
      setAlerts(alertResult.alerts || []);
      setStatus(statusResult);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load alerts.");
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold text-slate-900">Disaster Alerts</h1>
      <p className="mt-2 text-slate-500">Alerts are filtered for your account and institution. Demo-provider messages are not live government warnings.</p>
      {status?.isDemo && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Demo weather mode is active. No live official weather warnings are being claimed.</div>}
      {status?.isStale && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Live alert data is unavailable or stale. Follow official IMD and local authority updates directly.</div>}
      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="mt-6 space-y-4">
        {alerts.length === 0 && <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">No active alerts for you.</div>}
        {alerts.map((alert) => (
          <article key={alert._id} className={`rounded-xl border-l-4 bg-white p-5 shadow-sm ${alert.isMockDrill ? "border-amber-500" : "border-blue-700"}`}>
            <div className="flex flex-wrap items-center gap-2">
              {alert.isMockDrill && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">MOCK DRILL</span>}
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700">{alert.severity}</span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">{alert.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{alert.message}</p>
            <p className="mt-3 text-xs text-slate-500">Source: {alert.source} · Updated {new Date(alert.lastUpdatedAt).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
