"use client";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4" style={{ boxShadow: "0 1px 0 rgba(0, 0, 0, 0.06)" }}>
      <div>
        <h1 className="text-sm font-semibold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-[12px] text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
