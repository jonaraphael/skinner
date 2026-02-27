import { Difficulty } from "../app/types";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
  return <span className={`difficulty-badge ${difficulty}`}>{difficulty}</span>;
};
