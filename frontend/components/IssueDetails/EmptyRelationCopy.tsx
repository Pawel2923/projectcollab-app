import React from "react";

type EmptyRelationCopyProps = {
  message: string;
};

export function EmptyRelationCopy({ message }: EmptyRelationCopyProps) {
  return <p className="text-sm text-muted-foreground">{message}</p>;
}
