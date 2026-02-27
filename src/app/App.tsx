import { useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { installDebugWindowHook, pushDebugLog } from "../lib/debug/logger";
import { RewardModal } from "../components/RewardModal";
import { AppRoutes } from "./routes";
import { useSkinnerStore } from "./store";

const tabs = [
  { to: "/", label: "Today" },
  { to: "/tasks", label: "Tasks" },
  { to: "/upcoming", label: "Upcoming" },
  { to: "/rewards", label: "Rewards" },
  { to: "/settings", label: "Settings" }
];

export const App = () => {
  const location = useLocation();
  const hydrated = useSkinnerStore((state) => state.hydrated);
  const initializeFromStorage = useSkinnerStore((state) => state.initializeFromStorage);
  const rebuildOccurrences = useSkinnerStore((state) => state.rebuildOccurrences);
  const reduceMotion = useSkinnerStore((state) => state.prefs.reduceMotion);

  useEffect(() => {
    installDebugWindowHook();
    initializeFromStorage();
  }, [initializeFromStorage]);

  useEffect(() => {
    pushDebugLog("info", "route.change", { pathname: location.pathname });
  }, [location.pathname]);

  useEffect(() => {
    const run = () => rebuildOccurrences(new Date().toISOString());
    const timeout = window.setTimeout(run, 60_000);
    return () => window.clearTimeout(timeout);
  }, [location.pathname, rebuildOccurrences]);

  useEffect(() => {
    document.documentElement.dataset.motion = reduceMotion ? "reduce" : "full";
  }, [reduceMotion]);

  const shell = useMemo(() => {
    return (
      <div className="app-shell">
        <main className="main-content" aria-live="polite">
          <AppRoutes />
        </main>
        <nav className="tab-nav" aria-label="Primary">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => (isActive ? "tab-link active" : "tab-link")}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <RewardModal />
      </div>
    );
  }, []);

  if (!hydrated) {
    return (
      <div className="hydrate-gate" role="status" aria-live="polite">
        Loading SkinnerBox...
      </div>
    );
  }

  return shell;
};
