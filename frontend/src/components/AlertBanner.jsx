import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAlerts } from "../api/alertApi";

const AlertBanner = () => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await getAlerts();
        if (active) setAlert(result.alerts?.[0] || null);
      } catch {
        if (active) setAlert(null);
      }
    };
    load();
    const timer = setInterval(load, 60000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (!alert) return null;
  return (
    <div className={`mb-6 rounded-xl border px-4 py-3 ${alert.isMockDrill ? "border-amber-300 bg-amber-50 text-amber-950" : "border-blue-200 bg-blue-50 text-blue-950"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase">
            {alert.isMockDrill && <span className="rounded-full bg-amber-200 px-2 py-1">MOCK DRILL</span>}
            <span>{alert.severity} alert</span>
          </div>
          <p className="mt-1 font-semibold">{alert.title}</p>
          <p className="mt-1 text-sm">{alert.message}</p>
        </div>
        <Link to="/dashboard/alerts" className="rounded-lg border border-current px-3 py-2 text-sm font-semibold">View alerts</Link>
      </div>
    </div>
  );
};

export default AlertBanner;
