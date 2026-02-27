import { describe, expect, test } from "vitest";
import { createDefaultPersistedRoot, migratePersistedRoot } from "../lib/persistence/migration";

describe("storage migration", () => {
  test("falls back to defaults for invalid payload", () => {
    const migrated = migratePersistedRoot("bad");
    expect(migrated).toEqual(createDefaultPersistedRoot());
  });

  test("keeps v1 payload and fills defaults", () => {
    const migrated = migratePersistedRoot({ version: 1, tasks: [{ id: "t" }] });
    expect(migrated.version).toBe(1);
    expect(Array.isArray(migrated.tasks)).toBe(true);
    expect(Array.isArray(migrated.occurrences)).toBe(true);
    expect(Array.isArray(migrated.rewardEvents)).toBe(true);
  });
});
