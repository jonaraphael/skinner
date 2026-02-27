import { useMemo } from "react";
import { TopBar } from "../components/TopBar";
import { EmptyState } from "../components/EmptyState";
import { useSkinnerStore, selectRewardStats } from "../app/store";

export const Rewards = () => {
  const rewardEvents = useSkinnerStore((state) => state.rewardEvents);
  const rewardPool = useSkinnerStore((state) => state.rewardPool);
  const state = useSkinnerStore((snapshot) => snapshot);

  const rewardMap = useMemo(() => new Map(rewardPool.map((reward) => [reward.id, reward.title])), [rewardPool]);
  const stats = useMemo(() => selectRewardStats(state), [state]);

  return (
    <section className="screen">
      <TopBar title="Rewards" />

      <div className="stats-grid">
        <article>
          <h3>Completions</h3>
          <p>{stats.completions}</p>
        </article>
        <article>
          <h3>Triggered</h3>
          <p>{stats.triggered}</p>
        </article>
        <article>
          <h3>Observed Rate</h3>
          <p>{(stats.triggerRate * 100).toFixed(1)}%</p>
        </article>
        <article>
          <h3>Tiers</h3>
          <p>E {stats.tiers.easy} · M {stats.tiers.medium} · H {stats.tiers.hard}</p>
        </article>
      </div>

      {rewardEvents.length === 0 ? (
        <EmptyState title="No reward history yet" body="Complete tasks and reward events will appear here." />
      ) : (
        <div className="event-list">
          {rewardEvents.slice(0, 50).map((event) => (
            <article key={event.id} className="event-row">
              <p>
                {event.triggered
                  ? `Reward: ${rewardMap.get(event.rewardId ?? "") ?? event.rewardId}`
                  : "No reward this time"}
              </p>
              <p className="muted">
                {new Date(event.createdAtIso).toLocaleString()} · roll {event.roll.toFixed(3)} · p {event.probability}
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="pool-summary">
        <h2>Reward Pools</h2>
        <p>
          Easy: {rewardPool.filter((reward) => reward.tier === "easy").length} · Medium: {rewardPool.filter((reward) => reward.tier === "medium").length} · Hard: {rewardPool.filter((reward) => reward.tier === "hard").length}
        </p>
      </div>
    </section>
  );
};
