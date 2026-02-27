import { Difficulty } from "../app/types";

interface FilterChipsProps {
  value: Difficulty | "all";
  onChange: (value: Difficulty | "all") => void;
}

const chips: Array<Difficulty | "all"> = ["all", "easy", "medium", "hard"];

export const FilterChips = ({ value, onChange }: FilterChipsProps) => {
  return (
    <div className="chip-row" role="group" aria-label="Difficulty filter">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          className={chip === value ? "chip active" : "chip"}
          onClick={() => onChange(chip)}
        >
          {chip}
        </button>
      ))}
    </div>
  );
};
