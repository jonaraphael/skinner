interface EmptyStateProps {
  title: string;
  body: string;
}

export const EmptyState = ({ title, body }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
};
