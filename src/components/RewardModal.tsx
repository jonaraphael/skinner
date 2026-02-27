import { useMemo } from "react";
import { useSkinnerStore } from "../app/store";

export const RewardModal = () => {
  const activeRewardEvent = useSkinnerStore((state) => state.activeRewardEvent);
  const rewardPool = useSkinnerStore((state) => state.rewardPool);
  const dismiss = useSkinnerStore((state) => state.dismissRewardModal);

  const reward = useMemo(() => {
    if (!activeRewardEvent?.rewardId) {
      return null;
    }
    return rewardPool.find((item) => item.id === activeRewardEvent.rewardId) ?? null;
  }, [activeRewardEvent, rewardPool]);

  if (!activeRewardEvent || !activeRewardEvent.triggered) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Reward">
      <div className="modal-card">
        <p className="modal-kicker">Reward unlocked</p>
        <h2>{reward?.title ?? "Nice work"}</h2>
        <p className="modal-meta">
          Tier: {activeRewardEvent.rewardTier ?? "unknown"} · Roll: {activeRewardEvent.roll.toFixed(3)}
        </p>
        <button type="button" className="btn-primary" onClick={dismiss}>
          Continue
        </button>
      </div>
    </div>
  );
};
