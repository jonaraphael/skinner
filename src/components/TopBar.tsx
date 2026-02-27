import { ReactNode } from "react";

interface TopBarProps {
  title: string;
  rightSlot?: ReactNode;
}

export const TopBar = ({ title, rightSlot }: TopBarProps) => {
  return (
    <header className="top-bar">
      <h1>{title}</h1>
      {rightSlot ? <div>{rightSlot}</div> : null}
    </header>
  );
};
