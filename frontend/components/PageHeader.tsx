import React from "react";

type PageHeaderProps = {
  title: React.ReactNode;
  actions?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  actions,
  description,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={`space-y-2 ${className ?? ""}`}
      aria-labelledby="page-title"
    >
      <div className="flex items-center justify-between">
        <h1 id="page-title" className="text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {description ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
