import { useState } from "react";
import { TopBar } from "../components/TopBar";
import { useSkinnerStore } from "../app/store";

export const Settings = () => {
  const prefs = useSkinnerStore((state) => state.prefs);
  const setReduceMotion = useSkinnerStore((state) => state.setReduceMotion);
  const setTimezone = useSkinnerStore((state) => state.setTimezone);
  const exportBackup = useSkinnerStore((state) => state.exportBackup);
  const importBackup = useSkinnerStore((state) => state.importBackup);

  const [backup, setBackup] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  return (
    <section className="screen">
      <TopBar title="Settings" />

      <label className="toggle-row">
        <span>Reduced Motion</span>
        <input
          type="checkbox"
          checked={prefs.reduceMotion}
          onChange={(event) => setReduceMotion(event.target.checked)}
          aria-label="Reduced Motion"
        />
      </label>

      <label className="field">
        <span>Timezone</span>
        <input value={prefs.timezone} onChange={(event) => setTimezone(event.target.value)} />
      </label>

      <div className="section-stack">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setBackup(exportBackup())}
        >
          Export JSON Backup
        </button>

        <label className="field">
          <span>Import JSON Backup</span>
          <textarea
            rows={8}
            value={backup}
            onChange={(event) => setBackup(event.target.value)}
            placeholder="Paste backup JSON here"
          />
        </label>

        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            const ok = importBackup(backup);
            setImportStatus(ok ? "Import successful" : "Import failed");
          }}
        >
          Import Backup
        </button>

        {importStatus ? <p className="muted">{importStatus}</p> : null}
      </div>
    </section>
  );
};
